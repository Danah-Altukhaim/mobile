import { query } from '../connection';

export async function getStudentSchedule(studentId: string, termId?: string) {
  let termFilter = '';
  const params: unknown[] = [studentId];

  if (termId) {
    termFilter = 'AND e.term_id = $2';
    params.push(termId);
  } else {
    // Use current active term
    termFilter = `AND e.term_id = (
      SELECT t.id FROM terms t
      JOIN students s ON s.university_id = t.university_id AND s.id = $1
      WHERE t.start_date <= NOW() AND t.end_date >= NOW()
      ORDER BY t.start_date DESC LIMIT 1
    )`;
  }

  const result = await query(
    `SELECT e.id as enrollment_id, e.status,
            c.code as course_code, c.name_ar as course_name_ar, c.name_en as course_name_en, c.credit_hours,
            sec.schedule_slots, sec.room, sec.instructor_name_ar, sec.instructor_name_en,
            t.name_ar as term_name_ar, t.name_en as term_name_en
     FROM enrollments e
     JOIN sections sec ON e.section_id = sec.id
     JOIN courses c ON sec.course_id = c.id
     JOIN terms t ON e.term_id = t.id
     WHERE e.student_id = $1 AND e.status = 'enrolled' ${termFilter}
     AND e.deleted_at IS NULL
     ORDER BY c.code`,
    params,
  );
  return result.rows;
}

export async function getStudentGrades(studentId: string, termId?: string) {
  let termFilter = '';
  const params: unknown[] = [studentId];

  if (termId) {
    termFilter = 'AND e.term_id = $2';
    params.push(termId);
  }

  const result = await query(
    `SELECT e.id as enrollment_id, e.grade, e.grade_points, e.status,
            c.code as course_code, c.name_ar as course_name_ar, c.name_en as course_name_en, c.credit_hours,
            t.name_ar as term_name_ar, t.name_en as term_name_en, t.id as term_id
     FROM enrollments e
     JOIN sections sec ON e.section_id = sec.id
     JOIN courses c ON sec.course_id = c.id
     JOIN terms t ON e.term_id = t.id
     WHERE e.student_id = $1 ${termFilter}
     AND e.deleted_at IS NULL
     ORDER BY t.start_date DESC, c.code`,
    params,
  );

  // Calculate GPAs
  const courses = result.rows;
  const graded = courses.filter((c: any) => c.grade_points !== null);
  const totalPoints = graded.reduce((sum: number, c: any) => sum + c.grade_points * c.credit_hours, 0);
  const totalCredits = graded.reduce((sum: number, c: any) => sum + c.credit_hours, 0);
  const cumulativeGpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

  return {
    cumulative_gpa: cumulativeGpa,
    credits_completed: totalCredits,
    courses,
  };
}

export async function getAttendanceSummary(studentId: string) {
  const result = await query(
    `SELECT e.id as enrollment_id,
            c.code as course_code, c.name_ar as course_name_ar, c.name_en as course_name_en,
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE a.status = 'present') as present,
            COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
            COUNT(*) FILTER (WHERE a.status = 'excused') as excused,
            COUNT(*) FILTER (WHERE a.status = 'late') as late
     FROM enrollments e
     JOIN sections sec ON e.section_id = sec.id
     JOIN courses c ON sec.course_id = c.id
     LEFT JOIN attendance a ON a.enrollment_id = e.id
     WHERE e.student_id = $1 AND e.status = 'enrolled' AND e.deleted_at IS NULL
     GROUP BY e.id, c.code, c.name_ar, c.name_en
     ORDER BY c.code`,
    [studentId],
  );

  return result.rows.map((row: any) => ({
    ...row,
    total_sessions: parseInt(row.total_sessions),
    present: parseInt(row.present),
    absent: parseInt(row.absent),
    excused: parseInt(row.excused),
    late: parseInt(row.late),
    attendance_percentage:
      row.total_sessions > 0
        ? Math.round(((parseInt(row.present) + parseInt(row.late)) / parseInt(row.total_sessions)) * 10000) / 100
        : 100,
    warning: parseInt(row.absent) >= 3,
  }));
}

export async function getStudentAssignments(studentId: string) {
  const result = await query(
    `SELECT a.id, a.title, a.description, a.due_date, a.max_score, a.type,
            c.code as course_code, c.name_ar as course_name_ar, c.name_en as course_name_en,
            e.id as enrollment_id
     FROM assignments a
     JOIN sections sec ON a.section_id = sec.id
     JOIN courses c ON sec.course_id = c.id
     JOIN enrollments e ON e.section_id = sec.id AND e.student_id = $1
     WHERE e.status = 'enrolled' AND a.deleted_at IS NULL AND e.deleted_at IS NULL
     ORDER BY a.due_date ASC`,
    [studentId],
  );
  return result.rows;
}

export async function getStudentFees(studentId: string) {
  const feesResult = await query(
    `SELECT f.*, t.name_ar as term_name_ar, t.name_en as term_name_en
     FROM fees f
     JOIN terms t ON f.term_id = t.id
     WHERE f.student_id = $1
     ORDER BY f.due_date ASC`,
    [studentId],
  );

  const paymentsResult = await query(
    `SELECT * FROM payments
     WHERE student_id = $1 AND status = 'completed'
     ORDER BY created_at DESC`,
    [studentId],
  );

  const fees = feesResult.rows;
  const balanceDue = fees.reduce((sum: number, f: any) => sum + parseFloat(f.amount) - parseFloat(f.paid_amount), 0);
  const nextDueDate = fees.find((f: any) => parseFloat(f.amount) > parseFloat(f.paid_amount))?.due_date;

  return {
    balance_due: balanceDue,
    currency: fees[0]?.currency || 'KWD',
    next_due_date: nextDueDate || null,
    fees,
    recent_payments: paymentsResult.rows,
  };
}

export async function getDegreeAudit(studentId: string) {
  // Get all completed enrollments with grades
  const result = await query(
    `SELECT e.grade, e.grade_points, c.credit_hours, c.code, c.name_ar, c.name_en,
            c.department_id
     FROM enrollments e
     JOIN sections sec ON e.section_id = sec.id
     JOIN courses c ON sec.course_id = c.id
     WHERE e.student_id = $1 AND e.deleted_at IS NULL
     ORDER BY c.code`,
    [studentId],
  );

  const courses = result.rows;
  const completed = courses.filter((c: any) => c.grade && c.grade !== 'F');
  const inProgress = courses.filter((c: any) => !c.grade);
  const creditsCompleted = completed.reduce((sum: number, c: any) => sum + c.credit_hours, 0);
  const creditsInProgress = inProgress.reduce((sum: number, c: any) => sum + c.credit_hours, 0);

  return {
    total_credits_required: 136, // from student's program — would come from a programs table
    credits_completed: creditsCompleted,
    credits_in_progress: creditsInProgress,
    credits_remaining: Math.max(0, 136 - creditsCompleted - creditsInProgress),
    completion_percentage: Math.round((creditsCompleted / 136) * 100),
    courses: courses.map((c: any) => ({
      code: c.code,
      name_ar: c.name_ar,
      name_en: c.name_en,
      credits: c.credit_hours,
      status: c.grade ? (c.grade !== 'F' ? 'completed' : 'not_started') : 'in_progress',
      grade: c.grade,
    })),
  };
}
