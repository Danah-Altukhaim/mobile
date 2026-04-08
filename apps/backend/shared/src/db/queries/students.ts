import { query } from '../connection';

export async function getStudentById(studentId: string) {
  const result = await query(
    `SELECT s.*, u.name_ar as university_name_ar, u.name_en as university_name_en,
            u.currency, u.timezone
     FROM students s
     JOIN universities u ON s.university_id = u.id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [studentId],
  );
  return result.rows[0] || null;
}

export async function getStudentByEmail(universityId: string, email: string) {
  const result = await query(
    `SELECT * FROM students
     WHERE university_id = $1 AND email = $2 AND deleted_at IS NULL`,
    [universityId, email],
  );
  return result.rows[0] || null;
}

export async function getStudentSummary(studentId: string) {
  const student = await getStudentById(studentId);
  if (!student) return null;

  // Get current term
  const termResult = await query(
    `SELECT * FROM terms
     WHERE university_id = $1 AND start_date <= NOW() AND end_date >= NOW()
     ORDER BY start_date DESC LIMIT 1`,
    [student.university_id],
  );
  const currentTerm = termResult.rows[0];

  // Today's classes count
  const dayMap: Record<number, string> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday',
  };
  const today = dayMap[new Date().getDay()] || 'sunday';

  let todayClassesCount = 0;
  if (currentTerm) {
    const classesResult = await query(
      `SELECT COUNT(*) as count FROM enrollments e
       JOIN sections sec ON e.section_id = sec.id
       WHERE e.student_id = $1 AND e.term_id = $2 AND e.status = 'enrolled'
       AND sec.schedule_slots::jsonb @> $3::jsonb`,
      [studentId, currentTerm.id, JSON.stringify([{ day: today }])],
    );
    todayClassesCount = parseInt(classesResult.rows[0]?.count || '0');
  }

  // Upcoming deadlines (next 48 hours)
  const deadlinesResult = await query(
    `SELECT COUNT(*) as count FROM assignments a
     JOIN sections sec ON a.section_id = sec.id
     JOIN enrollments e ON e.section_id = sec.id AND e.student_id = $1
     WHERE a.due_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
     AND a.deleted_at IS NULL`,
    [studentId],
  );

  // Balance due
  const balanceResult = await query(
    `SELECT COALESCE(SUM(amount - paid_amount), 0) as balance_due,
            MIN(currency) as currency
     FROM fees
     WHERE student_id = $1 AND paid_amount < amount`,
    [studentId],
  );

  return {
    student,
    current_term: currentTerm
      ? { id: currentTerm.id, name_ar: currentTerm.name_ar, name_en: currentTerm.name_en }
      : null,
    today_classes_count: todayClassesCount,
    upcoming_deadlines_count: parseInt(deadlinesResult.rows[0]?.count || '0'),
    balance_due: parseFloat(balanceResult.rows[0]?.balance_due || '0'),
    currency: balanceResult.rows[0]?.currency || student.currency || 'KWD',
  };
}
