import { query } from '../connection';

export async function createConversation(studentId: string) {
  const result = await query(
    `INSERT INTO ai_conversations (student_id, messages) VALUES ($1, '[]') RETURNING *`,
    [studentId],
  );
  return result.rows[0];
}

export async function getConversation(conversationId: string) {
  const result = await query(
    'SELECT * FROM ai_conversations WHERE id = $1',
    [conversationId],
  );
  return result.rows[0] || null;
}

export async function appendMessage(
  conversationId: string,
  message: { role: string; content: string; timestamp: string; model?: string; sources?: any[] },
) {
  const result = await query(
    `UPDATE ai_conversations
     SET messages = messages || $1::jsonb, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [JSON.stringify([message]), conversationId],
  );
  return result.rows[0];
}

export async function updateConversationMeta(
  conversationId: string,
  data: { model_used?: string; tokens_input?: number; tokens_output?: number; confidence_score?: number; escalated?: boolean },
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (data.model_used !== undefined) { sets.push(`model_used = $${i++}`); params.push(data.model_used); }
  if (data.tokens_input !== undefined) { sets.push(`tokens_input = tokens_input + $${i++}`); params.push(data.tokens_input); }
  if (data.tokens_output !== undefined) { sets.push(`tokens_output = tokens_output + $${i++}`); params.push(data.tokens_output); }
  if (data.confidence_score !== undefined) { sets.push(`confidence_score = $${i++}`); params.push(data.confidence_score); }
  if (data.escalated !== undefined) { sets.push(`escalated = $${i++}`); params.push(data.escalated); }

  sets.push('updated_at = NOW()');
  params.push(conversationId);

  const result = await query(
    `UPDATE ai_conversations SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    params,
  );
  return result.rows[0];
}

export async function getStudentConversations(studentId: string, limit = 20) {
  const result = await query(
    `SELECT id, student_id, model_used, tokens_input, tokens_output, confidence_score, escalated,
            messages->0->>'content' as first_message, created_at, updated_at
     FROM ai_conversations
     WHERE student_id = $1
     ORDER BY updated_at DESC LIMIT $2`,
    [studentId, limit],
  );
  return result.rows;
}

// Risk alerts
export async function getAtRiskStudents(universityId: string) {
  const result = await query(
    `SELECT ra.*, s.name_ar as student_name_ar, s.name_en as student_name_en,
            s.student_number, s.email, s.gpa_cumulative
     FROM risk_alerts ra
     JOIN students s ON ra.student_id = s.id
     WHERE s.university_id = $1 AND ra.status = 'active'
     ORDER BY ra.risk_score DESC`,
    [universityId],
  );
  return result.rows;
}
