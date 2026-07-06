// Academic mock responses, derived from the real CCK catalog in @masari/shared.
// Per-student values come from DEMO_STUDENT below; everything else (course
// names, credits, prerequisites, the degree plan, fees) is real CCK data.
//
// Response shapes here must stay identical to what the screens consume — only
// the values are real. Static fixtures (campus/social/services) live in
// mock-data.ts.

import {
  getCourse,
  getProgram,
  calcTuition,
  buildInstallments,
  STANDARD_GRANT_RATE,
  STUDENT_CLUBS,
  FACULTY_COURSE_OFFERINGS,
  evaluateCriticalCase,
  type ProgramSlug,
  type ScheduleSlot,
} from '@masari/shared';

// ---------------------------------------------------------------------------
// The demo student — Noura, a Diploma of Computer Programming student in her
// 3rd semester. Semesters 1-2 are complete (with grades), semester 3 is in
// progress, semester 4 is not started.
// ---------------------------------------------------------------------------

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const PROGRAM: ProgramSlug = 'diploma-cp';
const CURRENT_SEMESTER = 3;

export const DEMO_STUDENT = {
  id: STUDENT_ID,
  name_ar: 'نورة الصباح',
  name_en: 'Noura Al-Sabah',
  email: 'noura@cck.edu.kw',
  student_number: '202401001',
  cohort_year: 2024,
  funding_type: 'puc' as const,
  program: PROGRAM,
  // Demographics for the CCK Hub Feedback v3 "Critical Cases" evaluation.
  nationality: 'kuwaiti',
  age: 20,
  level: 'diploma' as const,
};

// Final letter grades for the courses Noura has completed (semesters 1-2).
const COMPLETED_GRADES: Record<string, string> = {
  CST8101: 'A',
  CST8116: 'A-',
  CST8215: 'B+',
  CST8300: 'A',
  ENL1813: 'B+',
  MAT8001: 'B',
  CST2355: 'A-',
  CST8102: 'B+',
  CST8284: 'B',
  CST8285: 'A-',
  ENL1823: 'A',
  GED0022: 'B+',
};

// CCK Grading Policy v2 §6 — points-per-credit aligned with the canonical scheme.
const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  'A-': 3.67,
  'B+': 3.33,
  B: 3.0,
  'B-': 2.67,
  'C+': 2.33,
  C: 2.0,
  'C-': 1.67,
  'D+': 1.33,
  D: 1.0,
  F: 0,
  FA: 0,
};

// Terms, oldest first. The current term is the one in progress.
const TERMS = [
  { number: 1, name_ar: 'خريف ٢٠٢٤-٢٠٢٥', name_en: 'Fall 2024-2025' },
  { number: 2, name_ar: 'ربيع ٢٠٢٤-٢٠٢٥', name_en: 'Spring 2024-2025' },
  { number: 3, name_ar: 'خريف ٢٠٢٥-٢٠٢٦', name_en: 'Fall 2025-2026' },
];
const CURRENT_TERM = TERMS[CURRENT_SEMESTER - 1];

// ---------------------------------------------------------------------------
// Derived course lists from the real degree plan.
// ---------------------------------------------------------------------------

const program = getProgram(PROGRAM)!;
const completedCodes = program.semesters
  .filter((s) => s.number < CURRENT_SEMESTER)
  .flatMap((s) => s.courses);
const currentCodes = program.semesters.find((s) => s.number === CURRENT_SEMESTER)!.courses;
const futureCodes = program.semesters
  .filter((s) => s.number > CURRENT_SEMESTER)
  .flatMap((s) => s.courses);

// Stable enrollment ids for the current term, e.g. enr-001 … enr-005.
const enrollmentIds = currentCodes.map((_, i) => `enr-${String(i + 1).padStart(3, '0')}`);
const enrIdByCode: Record<string, string> = {};
currentCodes.forEach((code, i) => (enrIdByCode[code] = enrollmentIds[i]));

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function courseDisplay(code: string) {
  const c = getCourse(code);
  return {
    course_code: code,
    course_name_en: c?.name_en ?? code,
    course_name_ar: c?.name_ar ?? c?.name_en ?? code,
    credit_hours: c?.credit_hours ?? 3,
    // Instruction language (Arabic / English / bilingual) — CCK students study
    // in two languages per the Schedule Process and Rules doc.
    language: c?.language ?? 'en',
  };
}

// Real instructor for a course, falling back to the Advanced Technology HOD.
const FALLBACK_INSTRUCTOR = 'Ahmad Jaber Hadam Mayahi';
function instructorFor(code: string) {
  const offering = FACULTY_COURSE_OFFERINGS.find((o) => o.course_code === code);
  const name = offering?.instructor_name_en ?? FALLBACK_INSTRUCTOR;
  // Arabic faculty names are not in the source docs — use the English name in
  // both locales rather than fabricate a transliteration.
  return { instructor_name_ar: name, instructor_name_en: name };
}

// Hand-set timetable for the current (semester 3) courses, conflict-free.
const SCHEDULE_SLOTS: Record<string, ScheduleSlot[]> = {
  CST2234: [
    { day: 'sunday', start_time: '08:00', end_time: '10:00', room: 'B-201' },
    { day: 'tuesday', start_time: '08:00', end_time: '10:00', room: 'B-201' },
  ],
  CST2335: [
    { day: 'sunday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' },
    { day: 'tuesday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' },
  ],
  CST8109: [
    { day: 'monday', start_time: '08:00', end_time: '10:00', room: 'LAB-2' },
    { day: 'wednesday', start_time: '08:00', end_time: '10:00', room: 'LAB-2' },
  ],
  // Kept clear of the Monday 11:00-12:00 reserved academic hour (Schedule
  // Process and Rules doc) — no lecture may overlap that slot.
  CST8283: [
    { day: 'monday', start_time: '12:30', end_time: '14:30', room: 'LAB-1' },
    { day: 'wednesday', start_time: '12:30', end_time: '14:30', room: 'LAB-1' },
  ],
  CST8288: [
    { day: 'tuesday', start_time: '12:30', end_time: '14:30', room: 'B-203' },
    { day: 'thursday', start_time: '12:30', end_time: '14:30', room: 'B-203' },
  ],
};
function slotsFor(code: string): ScheduleSlot[] {
  return (
    SCHEDULE_SLOTS[code] ?? [
      { day: 'sunday', start_time: '08:00', end_time: '10:00', room: 'TBA' },
      { day: 'tuesday', start_time: '08:00', end_time: '10:00', room: 'TBA' },
    ]
  );
}
function scheduleSummary(code: string): string {
  const slots = slotsFor(code);
  const days = slots.map((s) => s.day.slice(0, 3).replace(/^./, (c) => c.toUpperCase())).join('/');
  return `${days} ${slots[0].start_time}-${slots[0].end_time}`;
}

// ---------------------------------------------------------------------------
// GPA — computed from real credit hours, never hard-coded.
// ---------------------------------------------------------------------------

function termGpa(codes: string[]): { gpa: number; points: number; credits: number } {
  let points = 0;
  let credits = 0;
  for (const code of codes) {
    const grade = COMPLETED_GRADES[code];
    const course = getCourse(code);
    if (grade && course && grade in GRADE_POINTS) {
      points += GRADE_POINTS[grade] * course.credit_hours;
      credits += course.credit_hours;
    }
  }
  return { gpa: credits ? round2(points / credits) : 0, points, credits };
}

const completedCredits = completedCodes.reduce(
  (sum, code) => sum + (getCourse(code)?.credit_hours ?? 0),
  0,
);
const currentCredits = currentCodes.reduce(
  (sum, code) => sum + (getCourse(code)?.credit_hours ?? 0),
  0,
);
const futureCredits = program.total_credits - completedCredits - currentCredits;

const cumulative = termGpa(completedCodes);
const gpaHistory = program.semesters
  .filter((s) => s.number < CURRENT_SEMESTER)
  .map((s) => {
    const term = TERMS[s.number - 1];
    return { term_name_ar: term.name_ar, term_name_en: term.name_en, gpa: termGpa(s.courses).gpa };
  });

// ---------------------------------------------------------------------------
// Fee breakdown — real CCK pricing via calcTuition.
// ---------------------------------------------------------------------------

const tuition = calcTuition({
  credits: currentCredits,
  track: 'diploma',
  level: 'diploma',
  discountRate: STANDARD_GRANT_RATE,
});
// First installment is paid, the rest are upcoming.
const paidSoFar = tuition.registrationFee + tuition.installments[0].amount;
const balanceDue = round2(tuition.totalPayable - paidSoFar);

// ---------------------------------------------------------------------------
// Response builders.
// ---------------------------------------------------------------------------

const studentMe = {
  success: true,
  data: {
    student: {
      id: STUDENT_ID,
      name_ar: DEMO_STUDENT.name_ar,
      name_en: DEMO_STUDENT.name_en,
      email: DEMO_STUDENT.email,
      major_name_ar: program.name_ar ?? program.name_en,
      major_name_en: program.name_en,
      gpa_cumulative: cumulative.gpa,
      student_number: DEMO_STUDENT.student_number,
      cohort_year: DEMO_STUDENT.cohort_year,
      funding_type: DEMO_STUDENT.funding_type,
    },
    current_term: { name_ar: CURRENT_TERM.name_ar, name_en: CURRENT_TERM.name_en },
    today_classes_count: currentCodes.filter((c) =>
      slotsFor(c).some((s) => s.day === 'sunday'),
    ).length,
    upcoming_deadlines_count: 3,
    balance_due: balanceDue,
    currency: 'KWD',
  },
};

const schedule = {
  success: true,
  data: currentCodes.map((code) => {
    const d = courseDisplay(code);
    const slots = slotsFor(code);
    return {
      enrollment_id: enrIdByCode[code],
      course_code: code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      credit_hours: d.credit_hours,
      language: d.language,
      schedule_slots: slots,
      room: slots[0].room,
      ...instructorFor(code),
    };
  }),
};

// CCK Hub Feedback v3 "Critical Cases" — surfaces the flag on the grades response so
// the mobile + admin screens can highlight at-risk students. Evaluates the full
// rule set (universal low-CGPA + the Kuwaiti-specific age/credits conditions).
const criticalCase = evaluateCriticalCase({
  cgpa: cumulative.gpa,
  nationality: DEMO_STUDENT.nationality,
  level: DEMO_STUDENT.level,
  age: DEMO_STUDENT.age,
  creditsCompletedOrEnrolled: completedCredits + currentCredits,
  creditsCompleted: completedCredits,
  creditsRemaining: program.total_credits - completedCredits,
});
const grades = {
  success: true,
  data: {
    cumulative_gpa: cumulative.gpa,
    credits_completed: completedCredits,
    academic_standing: cumulative.gpa < 2.0 ? 'probation' : 'good_standing',
    critical_case: criticalCase,
    gpa_history: gpaHistory,
    courses: currentCodes.map((code) => {
      const d = courseDisplay(code);
      return {
        enrollment_id: enrIdByCode[code],
        course_code: code,
        course_name_ar: d.course_name_ar,
        course_name_en: d.course_name_en,
        credit_hours: d.credit_hours,
        grade: null,
        grade_points: null,
      };
    }),
  },
};

// Mid-semester component breakdown for an in-progress course: early
// assessments scored, the final still pending.
function gradeDetailFor(code: string) {
  const d = courseDisplay(code);
  return {
    success: true,
    data: {
      enrollment_id: enrIdByCode[code],
      course_code: code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      grade: null,
      grade_points: null,
      components: [
        { name_ar: 'واجبات', name_en: 'Homework', weight: 20, score: 17, max_score: 20, class_average: 15.2 },
        { name_ar: 'اختبار قصير', name_en: 'Quizzes', weight: 15, score: 12, max_score: 15, class_average: 10.8 },
        { name_ar: 'اختبار منتصف الفصل', name_en: 'Midterm Exam', weight: 25, score: 20, max_score: 25, class_average: 17.5 },
        { name_ar: 'مشروع', name_en: 'Project', weight: 15, score: null, max_score: 15, class_average: null },
        { name_ar: 'اختبار نهائي', name_en: 'Final Exam', weight: 25, score: null, max_score: 25, class_average: null },
      ],
    },
  };
}

// Per-course attendance — varied so the FA thresholds are visible. absent_hours
// feeds getAttendanceThresholds() in the screen (degree track, by credit hours).
const ATTENDANCE_ABSENCE: Record<string, { absent: number; excused: number; late: number }> = {
  CST2234: { absent: 0, excused: 1, late: 1 },
  CST2335: { absent: 1, excused: 0, late: 0 },
  CST8109: { absent: 2, excused: 1, late: 0 }, // approaching first warning
  CST8283: { absent: 0, excused: 0, late: 2 },
  CST8288: { absent: 1, excused: 2, late: 1 },
};
const attendance = {
  success: true,
  data: currentCodes.map((code) => {
    const d = courseDisplay(code);
    const a = ATTENDANCE_ABSENCE[code] ?? { absent: 0, excused: 0, late: 0 };
    const totalSessions = 16;
    const present = totalSessions - a.absent - a.excused - a.late;
    // each weekly session ≈ 2 contact hours for these 4-credit courses
    const hoursPerSession = 2;
    return {
      enrollment_id: enrIdByCode[code],
      course_code: code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      track: 'degree',
      credit_hours: d.credit_hours,
      total_sessions: totalSessions,
      present,
      absent: a.absent,
      excused: a.excused,
      late: a.late,
      absent_hours: a.absent * hoursPerSession,
      excused_hours: a.excused * hoursPerSession,
      attendance_percentage: round2((present / totalSessions) * 100),
    };
  }),
};

const ASSIGNMENTS: { code: string; title_ar: string; title_en: string; due: string; max: number; type: string }[] = [
  { code: 'CST2234', title_ar: 'مخطط حالات الاستخدام', title_en: 'Use-Case Diagram', due: '2026-05-17T23:59:00Z', max: 20, type: 'homework' },
  { code: 'CST2335', title_ar: 'تطبيق واجهة الجوال', title_en: 'Mobile UI App', due: '2026-05-19T23:59:00Z', max: 30, type: 'project' },
  { code: 'CST8109', title_ar: 'اختبار قصير - برمجة المقابس', title_en: 'Quiz - Socket Programming', due: '2026-05-15T23:59:00Z', max: 10, type: 'quiz' },
  { code: 'CST8283', title_ar: 'تقرير الأعمال', title_en: 'Business Report Program', due: '2026-05-21T23:59:00Z', max: 25, type: 'homework' },
  { code: 'CST8288', title_ar: 'مشروع أنماط التصميم', title_en: 'Design Patterns Project', due: '2026-05-26T23:59:00Z', max: 40, type: 'project' },
];
const assignments = {
  success: true,
  data: ASSIGNMENTS.map((a, i) => {
    const d = courseDisplay(a.code);
    return {
      id: `asg-${String(i + 1).padStart(3, '0')}`,
      title_ar: a.title_ar,
      title_en: a.title_en,
      course_code: a.code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      due_date: a.due,
      max_score: a.max,
      type: a.type,
    };
  }),
};

const fees = {
  success: true,
  data: {
    balance_due: balanceDue,
    currency: 'KWD',
    next_due_date: '2026-06-01',
    fees: [
      {
        id: 'fee-tuition',
        type: 'tuition',
        description_ar: `الرسوم الدراسية — ${currentCredits} ساعة`,
        description_en: `Tuition — ${currentCredits} credit hours`,
        amount: String(tuition.netTuition),
        due_date: '2026-05-01',
        paid_amount: String(tuition.installments[0].amount),
        currency: 'KWD',
      },
      {
        id: 'fee-service',
        type: 'service',
        description_ar: 'رسوم خدمات الطلبة',
        description_en: 'Student Service Fee',
        amount: String(tuition.serviceFee),
        due_date: '2026-05-01',
        paid_amount: '0',
        currency: 'KWD',
      },
      {
        id: 'fee-registration',
        type: 'registration',
        description_ar: 'رسوم تسجيل المقررات',
        description_en: 'Course Registration Fee',
        amount: String(tuition.registrationFee),
        due_date: '2026-04-15',
        paid_amount: String(tuition.registrationFee),
        currency: 'KWD',
      },
    ],
    recent_payments: [
      { id: 'pay-001', amount: String(tuition.installments[0].amount), currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-04-28T10:00:00Z' },
      { id: 'pay-002', amount: String(tuition.registrationFee), currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-04-12T09:00:00Z' },
    ],
  },
};

// Degree audit mirrors the CCK major sheet: the plan grouped by year then
// semester. A whole semester shares one status — completed (before the current
// term), in_progress (the current term), or not_started (still ahead).
type AuditStatus = 'completed' | 'in_progress' | 'not_started';
function semesterStatus(num: number): AuditStatus {
  if (num < CURRENT_SEMESTER) return 'completed';
  if (num === CURRENT_SEMESTER) return 'in_progress';
  return 'not_started';
}

const degreeAudit = {
  success: true,
  data: {
    program_name_ar: program.name_ar ?? program.name_en,
    program_name_en: program.name_en,
    total_credits_required: program.total_credits,
    credits_completed: completedCredits,
    credits_in_progress: currentCredits,
    credits_remaining: futureCredits,
    completion_percentage: Math.round((completedCredits / program.total_credits) * 100),
    current_semester: CURRENT_SEMESTER,
    semesters: program.semesters.map((s) => {
      const status = semesterStatus(s.number);
      return {
        number: s.number,
        year: s.year,
        total_credits: s.total_credits,
        status,
        courses: s.courses.map((code) => {
          const c = getCourse(code);
          return {
            code,
            name_ar: c?.name_ar ?? c?.name_en ?? code,
            name_en: c?.name_en ?? code,
            credits: c?.credit_hours ?? 3,
            prerequisites: s.prerequisites[code] ?? [],
            status,
            grade: status === 'completed' ? COMPLETED_GRADES[code] ?? null : null,
          };
        }),
      };
    }),
  },
};

// Next-semester courses offered as registrable sections. A prerequisite is
// considered met if the student completed it or is taking it this term.
const passedOrEnrolled = new Set([...completedCodes, ...currentCodes]);
const SEATS: Record<string, [number, number]> = {};
const availableCourses = {
  success: true,
  data: futureCodes.map((code, i) => {
    const c = getCourse(code);
    const total = 35;
    const available = [12, 5, 0, 18, 22][i % 5];
    SEATS[code] = [available, total];
    const prerequisites = c?.prerequisites ?? [];
    return {
      id: `sec-${code}`,
      course_code: code,
      name_ar: c?.name_ar ?? c?.name_en ?? code,
      name_en: c?.name_en ?? code,
      credits: c?.credit_hours ?? 3,
      language: c?.language ?? 'en',
      prerequisites,
      prereqs_met: prerequisites.every((p) => passedOrEnrolled.has(p)),
      unmet_prerequisites: prerequisites.filter((p) => !passedOrEnrolled.has(p)),
      seats_available: available,
      total_seats: total,
      schedule: scheduleSummary(code),
      ...instructorFor(code),
    };
  }),
};

// Course recommendations follow the CCK major sheet: they are exactly the
// courses the plan schedules for the student's *next* term, ordered as the
// sheet lists them. Each course's priority and reason are derived from whether
// its major-sheet prerequisites are already cleared — never hand-picked.
const nextSemester = program.semesters.find((s) => s.number === CURRENT_SEMESTER + 1);
const nextSemesterCourses = nextSemester?.courses ?? [];

function workloadForCredits(credits: number): 'light' | 'moderate' | 'heavy' {
  if (credits >= 5) return 'heavy';
  if (credits >= 4) return 'moderate';
  return 'light';
}

const courseRecommendations = {
  success: true,
  data: nextSemesterCourses.map((code, i) => {
    const c = getCourse(code);
    const credits = c?.credit_hours ?? 3;
    const prerequisites = nextSemester!.prerequisites[code] ?? [];
    const unmet = prerequisites.filter((p) => !passedOrEnrolled.has(p));
    const ready = unmet.length === 0;
    // All prerequisites cleared → top priority; unmet chain → lower, and the
    // sheet order breaks ties so the list reads like the major sheet.
    const matchScore = (ready ? 96 : 74) - i * 2;
    const reason_en = !prerequisites.length
      ? `Semester ${nextSemester!.number} course on your ${program.name_en} plan — no prerequisites.`
      : ready
        ? `Semester ${nextSemester!.number} course — you have cleared all prerequisites (${prerequisites.join(', ')}).`
        : `Semester ${nextSemester!.number} course — finish ${unmet.join(', ')} before registering.`;
    const reason_ar = !prerequisites.length
      ? `مقرر الفصل ${nextSemester!.number} ضمن خطة ${program.name_ar ?? program.name_en} — بدون متطلبات سابقة.`
      : ready
        ? `مقرر الفصل ${nextSemester!.number} — أكملت جميع المتطلبات السابقة (${prerequisites.join('، ')}).`
        : `مقرر الفصل ${nextSemester!.number} — أكمل ${unmet.join('، ')} قبل التسجيل.`;
    const [available, total] = SEATS[code] ?? [20, 35];
    return {
      id: `rec-${String(i + 1).padStart(3, '0')}`,
      course_code: code,
      name_ar: c?.name_ar ?? c?.name_en ?? code,
      name_en: c?.name_en ?? code,
      credits,
      language: c?.language ?? 'en',
      reason_ar,
      reason_en,
      match_score: Math.max(matchScore, 50),
      workload_level: workloadForCredits(credits),
      plan_semester: nextSemester!.number,
      prereqs_met: ready,
      unmet_prerequisites: unmet,
      schedule: scheduleSummary(code),
      seats_available: available,
      total_seats: total,
      prerequisites,
    };
  }),
};

// ---------------------------------------------------------------------------
// Class channels — one per current course.
// ---------------------------------------------------------------------------

const CHANNEL_LAST_MESSAGE: Record<string, { ar: string; en: string; announcement: boolean }> = {
  CST2234: { ar: 'سلّموا مخطط حالات الاستخدام قبل الأحد.', en: 'Submit your use-case diagram before Sunday.', announcement: true },
  CST2335: { ar: 'مختبر اليوم عن تخطيطات Flutter.', en: "Today's lab covers Flutter layouts.", announcement: false },
  CST8109: { ar: 'اختبار قصير الأربعاء عن برمجة المقابس.', en: 'Quiz Wednesday on socket programming.', announcement: true },
  CST8283: { ar: 'تم رفع بيانات الواجب على بلاكبورد.', en: 'Assignment data files are on Blackboard.', announcement: true },
  CST8288: { ar: 'مجموعات المشروع: ٣-٤ طلاب، سجّلوا هذا الأسبوع.', en: 'Project groups: 3-4 students, sign up this week.', announcement: true },
};

const classChannels = {
  success: true,
  data: currentCodes.map((code, i) => {
    const d = courseDisplay(code);
    const msg = CHANNEL_LAST_MESSAGE[code] ?? { ar: 'مرحباً بكم في القناة.', en: 'Welcome to the channel.', announcement: false };
    return {
      id: enrIdByCode[code],
      course_code: code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      ...instructorFor(code),
      last_message: {
        content_ar: msg.ar,
        content_en: msg.en,
        sent_at: `2026-05-${String(11 + i).padStart(2, '0')}T10:00:00Z`,
        is_announcement: msg.announcement,
      },
      unread_count: [2, 0, 1, 0, 3][i % 5],
      member_count: [38, 32, 41, 29, 35][i % 5],
    };
  }),
};

function channelDetail(code: string) {
  const d = courseDisplay(code);
  const inst = instructorFor(code);
  const msg = CHANNEL_LAST_MESSAGE[code] ?? { ar: 'مرحباً بكم في القناة.', en: 'Welcome to the channel.', announcement: false };
  return {
    success: true,
    data: {
      id: enrIdByCode[code],
      course_code: code,
      course_name_ar: d.course_name_ar,
      course_name_en: d.course_name_en,
      ...inst,
      member_count: 35,
      pinned: [
        {
          id: `pin-${code}`,
          content_ar: 'الساعات المكتبية: الاثنين ١١:٠٠-١٢:٠٠، خارج أوقات المحاضرات.',
          content_en: 'Office hours: Monday 11:00-12:00, outside lecture times.',
          sent_at: '2026-04-20T08:00:00Z',
        },
      ],
      messages: [
        {
          id: `m-${code}-1`,
          sender_type: 'instructor',
          sender_name_ar: inst.instructor_name_ar,
          sender_name_en: inst.instructor_name_en,
          content_ar: `أهلاً بكم في مادة ${code}. المادة الأسبوعية تُرفع كل سبت.`,
          content_en: `Welcome to ${code}. Weekly material is uploaded every Saturday.`,
          sent_at: '2026-04-20T08:05:00Z',
          is_announcement: true,
        },
        {
          id: `m-${code}-2`,
          sender_type: 'student',
          sender_name_ar: DEMO_STUDENT.name_ar,
          sender_name_en: DEMO_STUDENT.name_en,
          content_ar: 'دكتور، هل المحاضرة القادمة حضورية؟',
          content_en: 'Dr., is the next lecture in person?',
          sent_at: '2026-05-09T11:00:00Z',
        },
        {
          id: `m-${code}-3`,
          sender_type: 'instructor',
          sender_name_ar: inst.instructor_name_ar,
          sender_name_en: inst.instructor_name_en,
          content_ar: msg.ar,
          content_en: msg.en,
          sent_at: '2026-05-11T10:00:00Z',
          is_announcement: msg.announcement,
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Clubs — the real CCK student clubs.
// ---------------------------------------------------------------------------

type ClubMeta = {
  category: string;
  members: number;
  desc_ar: string;
  desc_en: string;
  advisor_name_en: string;
  advisor_name_ar: string;
};
const CLUB_META: Record<string, ClubMeta> = {
  media: {
    category: 'media',
    members: 41,
    desc_ar: 'إنتاج المحتوى الإعلامي وتغطية فعاليات الكلية.',
    desc_en: 'Media content production and coverage of college events.',
    advisor_name_en: 'Ms. Latifa Al-Mutairi',
    advisor_name_ar: 'أ. لطيفة المطيري',
  },
  community: {
    category: 'community',
    members: 56,
    desc_ar: 'مبادرات تطوعية وخدمة المجتمع.',
    desc_en: 'Volunteering initiatives and community service.',
    advisor_name_en: 'Dr. Hessa Al-Otaibi',
    advisor_name_ar: 'د. حصة العتيبي',
  },
  'student-workers': {
    category: 'careers',
    members: 23,
    desc_ar: 'دعم الطلبة الذين يجمعون بين الدراسة والعمل.',
    desc_en: 'Support for students balancing study and work.',
    advisor_name_en: 'Mr. Faisal Al-Rashidi',
    advisor_name_ar: 'أ. فيصل الرشيدي',
  },
  'computer-science': {
    category: 'technology',
    members: 48,
    desc_ar: 'هاكاثونات وورش برمجة لطلبة التقنية.',
    desc_en: 'Hackathons and coding workshops for tech students.',
    advisor_name_en: 'Dr. Yousef Al-Sabah',
    advisor_name_ar: 'د. يوسف الصباح',
  },
  debate: {
    category: 'culture',
    members: 34,
    desc_ar: 'مناظرات وتدريب على الإلقاء والحجاج.',
    desc_en: 'Debates and training in public speaking and argumentation.',
    advisor_name_en: 'Dr. Noura Al-Fadhli',
    advisor_name_ar: 'د. نورة الفضلي',
  },
};
// Per-club membership state. Joining a club is NOT instant: the request is
// routed to the Club Advisor for approval (Student Life requirement).
//   is_member        -> the student is an approved member
//   request_status   -> 'pending' means a join request awaits advisor approval
const CLUB_MEMBERSHIP: Record<string, { is_member: boolean; request_status?: 'pending' }> = {
  'computer-science': { is_member: true },
  debate: { is_member: false, request_status: 'pending' },
};
const clubs = {
  success: true,
  data: STUDENT_CLUBS.map((club) => {
    const meta: ClubMeta =
      CLUB_META[club.slug] ?? {
        category: 'general',
        members: 20,
        desc_ar: '',
        desc_en: '',
        advisor_name_en: '',
        advisor_name_ar: '',
      };
    const membership = CLUB_MEMBERSHIP[club.slug] ?? { is_member: false };
    return {
      id: `club-${club.slug}`,
      name_ar: club.name_ar ?? club.name_en,
      name_en: club.name_en,
      description_ar: meta.desc_ar,
      description_en: meta.desc_en,
      category: meta.category,
      member_count: meta.members,
      status: 'active',
      advisor_name_en: meta.advisor_name_en,
      advisor_name_ar: meta.advisor_name_ar,
      is_member: membership.is_member,
      request_status: membership.request_status ?? null,
    };
  }),
};

// ---------------------------------------------------------------------------
// Club channels — chat space for clubs the student has joined. Mirrors the
// class-channel shape so the same screens render both.
// ---------------------------------------------------------------------------

const CLUB_CHANNEL_LAST_MESSAGE: Record<string, { ar: string; en: string; announcement: boolean }> = {
  'computer-science': {
    ar: 'هاكاثون نهاية الفصل يوم الخميس، سجّلوا فرقكم.',
    en: 'End-of-term hackathon on Thursday — register your teams.',
    announcement: true,
  },
};

const joinedClubSlugs = STUDENT_CLUBS.map((c) => c.slug).filter(
  (slug) => (CLUB_MEMBERSHIP[slug] ?? { is_member: false }).is_member,
);

function clubChannelBase(slug: string) {
  const club = STUDENT_CLUBS.find((c) => c.slug === slug);
  const meta = CLUB_META[slug];
  return { club, meta };
}

const clubChannels = {
  success: true,
  data: joinedClubSlugs.map((slug, i) => {
    const { club, meta } = clubChannelBase(slug);
    const msg = CLUB_CHANNEL_LAST_MESSAGE[slug] ?? {
      ar: 'مرحباً بكم في قناة النادي.',
      en: 'Welcome to the club channel.',
      announcement: false,
    };
    return {
      id: `club-channel-${slug}`,
      club_slug: slug,
      club_name_ar: club?.name_ar ?? club?.name_en ?? slug,
      club_name_en: club?.name_en ?? slug,
      advisor_name_ar: meta?.advisor_name_ar ?? '',
      advisor_name_en: meta?.advisor_name_en ?? '',
      last_message: {
        content_ar: msg.ar,
        content_en: msg.en,
        sent_at: `2026-05-${String(14 + i).padStart(2, '0')}T12:00:00Z`,
        is_announcement: msg.announcement,
      },
      unread_count: [1, 0, 2][i % 3],
      member_count: meta?.members ?? 20,
    };
  }),
};

function clubChannelDetail(slug: string) {
  const { club, meta } = clubChannelBase(slug);
  if (!club) return { success: true, data: null };
  const msg = CLUB_CHANNEL_LAST_MESSAGE[slug] ?? {
    ar: 'مرحباً بكم في قناة النادي.',
    en: 'Welcome to the club channel.',
    announcement: false,
  };
  return {
    success: true,
    data: {
      id: `club-channel-${slug}`,
      club_slug: slug,
      club_name_ar: club.name_ar ?? club.name_en,
      club_name_en: club.name_en,
      advisor_name_ar: meta?.advisor_name_ar ?? '',
      advisor_name_en: meta?.advisor_name_en ?? '',
      member_count: meta?.members ?? 20,
      pinned: [
        {
          id: `club-pin-${slug}`,
          content_ar: 'اجتماعات النادي كل ثلاثاء الساعة ٢:٠٠ في قاعة الأنشطة.',
          content_en: 'Club meetings every Tuesday at 2:00 PM in the Activities Hall.',
          sent_at: '2026-04-22T08:00:00Z',
        },
      ],
      messages: [
        {
          id: `club-m-${slug}-1`,
          sender_type: 'advisor',
          sender_name_ar: meta?.advisor_name_ar ?? '',
          sender_name_en: meta?.advisor_name_en ?? '',
          content_ar: `أهلاً بكم في ${club.name_ar ?? club.name_en}. تابعوا الإعلانات هنا.`,
          content_en: `Welcome to ${club.name_en}. Watch this space for announcements.`,
          sent_at: '2026-04-22T08:05:00Z',
          is_announcement: true,
        },
        {
          id: `club-m-${slug}-2`,
          sender_type: 'member',
          sender_name_ar: 'سارة العنزي',
          sender_name_en: 'Sara Al-Anzi',
          content_ar: 'متحمسة للفعالية! من معي بالفريق؟',
          content_en: 'Excited for the event! Who is on my team?',
          sent_at: '2026-05-13T15:30:00Z',
        },
        {
          id: `club-m-${slug}-3`,
          sender_type: 'advisor',
          sender_name_ar: meta?.advisor_name_ar ?? '',
          sender_name_en: meta?.advisor_name_en ?? '',
          content_ar: msg.ar,
          content_en: msg.en,
          sent_at: '2026-05-14T12:00:00Z',
          is_announcement: msg.announcement,
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Payments — installment plan + history from the real fee calc.
// ---------------------------------------------------------------------------

const installmentPlan = {
  success: true,
  data: {
    plan_name_ar: 'خطة تقسيط الرسوم الدراسية',
    plan_name_en: 'Tuition Installment Plan',
    total_amount: tuition.installmentBalance,
    currency: 'KWD',
    installments: tuition.installments.map((inst, i) => ({
      id: `inst-${String(i + 1).padStart(3, '0')}`,
      amount: inst.amount,
      // installments are due in study weeks 4 / 8 / 12 of the term
      due_date: ['2026-05-01', '2026-05-29', '2026-06-26'][i],
      status: i === 0 ? 'paid' : 'upcoming',
      paid_date: i === 0 ? '2026-04-28' : null,
    })),
  },
};

const paymentHistory = {
  success: true,
  data: [
    {
      id: 'pay-001',
      amount: tuition.installments[0].amount,
      currency: 'KWD',
      status: 'completed',
      method: 'knet',
      description_ar: 'القسط الأول — الرسوم الدراسية',
      description_en: 'First installment — tuition',
      created_at: '2026-04-28T10:00:00Z',
    },
    {
      id: 'pay-002',
      amount: tuition.registrationFee,
      currency: 'KWD',
      status: 'completed',
      method: 'knet',
      description_ar: 'رسوم تسجيل المقررات',
      description_en: 'Course registration fee',
      created_at: '2026-04-12T09:00:00Z',
    },
  ],
};

// ---------------------------------------------------------------------------
// Assembled response map, keyed by API path (same keys as before).
// ---------------------------------------------------------------------------

export const academicMockResponses: Record<string, any> = {
  '/api/v1/students/me': studentMe,
  '/api/v1/students/me/schedule': schedule,
  '/api/v1/students/me/grades': grades,
  '/api/v1/students/me/attendance': attendance,
  '/api/v1/students/me/assignments': assignments,
  '/api/v1/students/me/fees': fees,
  '/api/v1/students/me/degree-audit': degreeAudit,
  '/api/v1/students/me/available-courses': availableCourses,
  '/api/v1/ai/course-recommendations': courseRecommendations,
  '/api/v1/campus/class-channels': classChannels,
  '/api/v1/campus/club-channels': clubChannels,
  '/api/v1/clubs': clubs,
  '/api/v1/payments/installments': installmentPlan,
  '/api/v1/payments/history': paymentHistory,
};

// per-course grade detail + class channel detail endpoints
for (const code of currentCodes) {
  const enr = enrIdByCode[code];
  academicMockResponses[`/api/v1/students/me/grades/${enr}`] = gradeDetailFor(code);
  academicMockResponses[`/api/v1/campus/class-channels/${enr}`] = channelDetail(code);
}

// per-club channel detail endpoints (joined clubs only)
for (const slug of joinedClubSlugs) {
  academicMockResponses[`/api/v1/campus/club-channels/club-channel-${slug}`] =
    clubChannelDetail(slug);
}
