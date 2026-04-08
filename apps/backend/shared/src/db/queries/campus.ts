import { query } from '../connection';

export async function getEvents(universityId: string, options?: { limit?: number; cursor?: string }) {
  const limit = options?.limit || 20;
  const params: unknown[] = [universityId, limit + 1];
  let cursorFilter = '';

  if (options?.cursor) {
    cursorFilter = 'AND e.start_time > $3';
    params.push(options.cursor);
  }

  const result = await query(
    `SELECT e.*,
       (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id) as rsvp_count
     FROM events e
     WHERE e.university_id = $1 AND e.deleted_at IS NULL
     AND e.end_time >= NOW()
     ${cursorFilter}
     ORDER BY e.start_time ASC
     LIMIT $2`,
    params,
  );
  return result.rows;
}

export async function getEventById(eventId: string) {
  const result = await query(
    `SELECT e.*,
       (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id) as rsvp_count
     FROM events e WHERE e.id = $1 AND e.deleted_at IS NULL`,
    [eventId],
  );
  return result.rows[0] || null;
}

export async function rsvpEvent(eventId: string, studentId: string) {
  // Check capacity
  const event = await getEventById(eventId);
  if (!event) return { error: 'NOT_FOUND' };

  if (event.capacity && parseInt(event.rsvp_count) >= event.capacity) {
    return { error: 'EVENT_FULL' };
  }

  try {
    await query(
      `INSERT INTO event_rsvps (event_id, student_id) VALUES ($1, $2)
       ON CONFLICT (event_id, student_id) DO NOTHING`,
      [eventId, studentId],
    );
  } catch {
    // Already RSVP'd — that's fine
  }

  const countResult = await query(
    'SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = $1',
    [eventId],
  );
  return { rsvp_count: parseInt(countResult.rows[0].count) };
}

export async function cancelRsvp(eventId: string, studentId: string) {
  await query(
    'DELETE FROM event_rsvps WHERE event_id = $1 AND student_id = $2',
    [eventId, studentId],
  );
}

export async function getClubs(universityId: string) {
  const result = await query(
    `SELECT c.*,
       (SELECT COUNT(*) FROM club_memberships m WHERE m.club_id = c.id) as member_count
     FROM clubs c
     WHERE c.university_id = $1 AND c.status = 'active' AND c.deleted_at IS NULL
     ORDER BY c.name_ar`,
    [universityId],
  );
  return result.rows;
}

export async function joinClub(clubId: string, studentId: string) {
  try {
    await query(
      `INSERT INTO club_memberships (club_id, student_id) VALUES ($1, $2)
       ON CONFLICT (club_id, student_id) DO NOTHING`,
      [clubId, studentId],
    );
  } catch {
    // Already a member
  }

  const countResult = await query(
    'SELECT COUNT(*) as count FROM club_memberships WHERE club_id = $1',
    [clubId],
  );
  return { member_count: parseInt(countResult.rows[0].count) };
}

export async function isStudentRsvped(eventId: string, studentId: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM event_rsvps WHERE event_id = $1 AND student_id = $2',
    [eventId, studentId],
  );
  return result.rows.length > 0;
}

export async function isStudentMember(clubId: string, studentId: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM club_memberships WHERE club_id = $1 AND student_id = $2',
    [clubId, studentId],
  );
  return result.rows.length > 0;
}
