import pg from 'pg';

let dbAvailable = false;
let pool: pg.Pool;

try {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://masari:masari_dev@localhost:5432/masari',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  pool.on('error', () => {
    dbAvailable = false;
  });

  // Test connection on startup
  pool.query('SELECT 1').then(() => {
    dbAvailable = true;
    console.log('[DB] PostgreSQL connected');
  }).catch(() => {
    dbAvailable = false;
    console.log('[DB] PostgreSQL not available — using mock data fallback');
  });
} catch {
  pool = null as any;
  console.log('[DB] PostgreSQL not available — using mock data fallback');
}

export { pool };
export function isDbAvailable() { return dbAvailable; }

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  if (!dbAvailable || !pool) {
    throw new Error('DB_NOT_AVAILABLE');
  }
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('Executed query', { text: text.slice(0, 80), duration, rows: result.rowCount });
  }
  return result;
}

export async function getClient() {
  if (!dbAvailable || !pool) throw new Error('DB_NOT_AVAILABLE');
  return pool.connect();
}

export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (!dbAvailable || !pool) throw new Error('DB_NOT_AVAILABLE');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
