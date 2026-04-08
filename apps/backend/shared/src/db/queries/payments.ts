import { query, transaction } from '../connection';

export async function createPayment(data: {
  studentId: string;
  termId: string;
  amount: number;
  currency: string;
  method: string;
  feeIds: string[];
  idempotencyKey: string;
}) {
  return transaction(async (client) => {
    // Check idempotency
    const existing = await client.query(
      'SELECT * FROM payments WHERE idempotency_key = $1',
      [data.idempotencyKey],
    );
    if (existing.rows[0]) return existing.rows[0];

    const result = await client.query(
      `INSERT INTO payments (student_id, term_id, amount, currency, method, idempotency_key, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [data.studentId, data.termId, data.amount, data.currency, data.method, data.idempotencyKey],
    );
    return result.rows[0];
  });
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  tapReference?: string,
) {
  return transaction(async (client) => {
    const result = await client.query(
      `UPDATE payments SET status = $1, tap_reference = COALESCE($2, tap_reference), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, tapReference, paymentId],
    );
    const payment = result.rows[0];

    // If completed, update fee paid amounts
    if (status === 'completed' && payment) {
      // Apply payment to oldest unpaid fees for this student/term
      const fees = await client.query(
        `SELECT * FROM fees WHERE student_id = $1 AND term_id = $2 AND paid_amount < amount
         ORDER BY due_date ASC`,
        [payment.student_id, payment.term_id],
      );

      let remaining = parseFloat(payment.amount);
      for (const fee of fees.rows) {
        if (remaining <= 0) break;
        const owed = parseFloat(fee.amount) - parseFloat(fee.paid_amount);
        const apply = Math.min(remaining, owed);
        await client.query(
          'UPDATE fees SET paid_amount = paid_amount + $1, updated_at = NOW() WHERE id = $2',
          [apply, fee.id],
        );
        remaining -= apply;
      }
    }

    return payment;
  });
}

export async function getPaymentById(paymentId: string) {
  const result = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
  return result.rows[0] || null;
}

export async function getPaymentByTapReference(tapReference: string) {
  const result = await query('SELECT * FROM payments WHERE tap_reference = $1', [tapReference]);
  return result.rows[0] || null;
}

export async function getStudentPayments(studentId: string, limit = 20) {
  const result = await query(
    `SELECT * FROM payments WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [studentId, limit],
  );
  return result.rows;
}
