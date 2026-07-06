/* ────────────────────────────────────────────────────────────
 * Unified student record directory.
 *   Backs the Student Profiles section - a single staff-facing
 *   view that aggregates everything we hold on a student across
 *   the three source systems:
 *     • SIS  (Banner)      → enrolment, transcript, GPA, warnings, holds
 *     • LMS  (Blackboard)  → attendance, assignment progress, course scores
 *     • App  (Student Hub) → logins, AI advisor chats, submitted requests
 *   Mock data - admin app is a standalone front-end with no backend
 *   wired up yet. Numbers are kept consistent with the Finance mock
 *   (same student numbers / names) so figures line up across screens.
 * ──────────────────────────────────────────────────────────── */

export type DataSource = 'sis' | 'lms' | 'app';

export type EnrollmentStatus =
  | 'enrolled' | 'probation' | 'suspended' | 'graduated' | 'withdrawn';

export type WarningSeverity = 'info' | 'warning' | 'critical';

export type WarningStatus = 'active' | 'acknowledged' | 'resolved';

export type RequestStatus =
  | 'submitted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export type AccountStanding = 'cleared' | 'on_track' | 'hold';

export type AppChannel = 'app' | 'ai_advisor' | 'lms' | 'web';

export interface TranscriptRow {
  term: string;
  course_code: string;
  course_en: string;
  course_ar: string;
  credits: number;
  grade: string;
  points: number;
}

export interface TermGpa {
  term: string;
  gpa: number;
  credits: number;
  status_en: string;
  status_ar: string;
}

export interface StudentWarning {
  id: string;
  type_en: string;
  type_ar: string;
  severity: WarningSeverity;
  term: string;
  date: string;
  detail_en: string;
  detail_ar: string;
  status: WarningStatus;
}

export interface StudentHold {
  type_en: string;
  type_ar: string;
  reason_en: string;
  reason_ar: string;
  placed_by_en: string;
  placed_by_ar: string;
  date: string;
  active: boolean;
}

/** One weighted component of a course grade (quiz set, midterm, final, …). */
export interface LmsScoreItem {
  label_en: string;
  label_ar: string;
  score: number; // points earned
  max: number; // points possible
  weight: number; // % contribution to the final grade
}

export interface LmsCourse {
  course_code: string;
  course_en: string;
  course_ar: string;
  attendance_rate: number;
  assignments_submitted: number;
  assignments_total: number;
  current_score: number;
  midterm_score: number; // out of 100
  final_score: number; // out of 100
  score_breakdown: LmsScoreItem[];
  last_access: string;
}

export interface AppEvent {
  date: string;
  action_en: string;
  action_ar: string;
  channel: AppChannel;
}

export interface LinkedRequest {
  id: string;
  type_en: string;
  type_ar: string;
  status: RequestStatus;
  submitted_at: string;
}

export interface FinanceSummary {
  balance: number;
  total_payable: number;
  paid_amount: number;
  late_fee: number;
  standing: AccountStanding;
}

export interface StudentRecord {
  /** Route id - we use the student number so URLs read /students/20240118. */
  id: string;
  student_number: string;
  national_id: string;
  name_en: string;
  name_ar: string;
  email: string;
  phone: string;
  address_en: string;
  address_ar: string;
  program_en: string;
  program_ar: string;
  level: 'diploma' | 'foundation' | 'bachelor';
  cohort_year: number;
  enrollment_status: EnrollmentStatus;
  academic_standing_en: string;
  academic_standing_ar: string;
  gpa_cumulative: number;
  gpa_term: number;
  credits_completed: number;
  credits_required: number;
  advisor_en: string;
  advisor_ar: string;
  funding: 'puc' | 'self';
  // SIS
  gpa_history: TermGpa[];
  transcript: TranscriptRow[];
  warnings: StudentWarning[];
  holds: StudentHold[];
  // LMS
  lms_courses: LmsCourse[];
  // App / Student Hub
  app_last_login: string;
  app_logins_30d: number;
  ai_conversations: number;
  app_timeline: AppEvent[];
  requests: LinkedRequest[];
  // Finance
  finance: FinanceSummary;
}

/** Lightweight row for the searchable directory list. */
export interface StudentDirectoryEntry {
  id: string;
  student_number: string;
  name_en: string;
  name_ar: string;
  program_en: string;
  program_ar: string;
  level: 'diploma' | 'foundation' | 'bachelor';
  cohort_year: number;
  enrollment_status: EnrollmentStatus;
  gpa_cumulative: number;
  active_warnings: number;
  active_holds: number;
  balance: number;
}

const GOOD_EN = 'Good Standing';
const GOOD_AR = 'وضع جيد';
const WARN_EN = 'Academic Warning';
const WARN_AR = 'إنذار أكاديمي';
const PROB_EN = 'Academic Probation';
const PROB_AR = 'مراقبة أكاديمية';

/** Standard 5-component grade breakdown; weights total 100%. */
const breakdown = (
  quiz: number, assign: number, part: number, mid: number, fin: number,
): LmsScoreItem[] => [
  { label_en: 'Quizzes', label_ar: 'الاختبارات القصيرة', score: quiz, max: 10, weight: 10 },
  { label_en: 'Assignments', label_ar: 'الواجبات', score: assign, max: 20, weight: 20 },
  { label_en: 'Participation', label_ar: 'المشاركة', score: part, max: 10, weight: 10 },
  { label_en: 'Midterm Exam', label_ar: 'اختبار منتصف الفصل', score: mid, max: 100, weight: 25 },
  { label_en: 'Final Exam', label_ar: 'الاختبار النهائي', score: fin, max: 100, weight: 35 },
];

export const STUDENT_RECORDS: StudentRecord[] = [
  {
    id: '20240118', student_number: '20240118', national_id: '304091200847',
    name_en: 'Noura Al-Shahri', name_ar: 'نورة الشهري',
    email: '20240118@stu.cck.edu.kw', phone: '+965 9012 4471',
    address_en: 'Salmiya, Block 10, Street 5, House 22', address_ar: 'السالمية، قطعة 10، شارع 5، منزل 22',
    program_en: 'Diploma in Computer Programming', program_ar: 'دبلوم برمجة الحاسوب',
    level: 'diploma', cohort_year: 2024, enrollment_status: 'enrolled',
    academic_standing_en: GOOD_EN, academic_standing_ar: GOOD_AR,
    gpa_cumulative: 3.45, gpa_term: 3.6, credits_completed: 45, credits_required: 66,
    advisor_en: 'Dr. Omar Al-Barno', advisor_ar: 'د. عمر البرنو', funding: 'puc',
    gpa_history: [
      { term: 'Fall 2024', gpa: 3.3, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Winter 2025', gpa: 3.45, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Fall 2025', gpa: 3.6, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'CST2234', course_en: 'Web Programming', course_ar: 'برمجة الويب', credits: 3, grade: 'A', points: 4.0 },
      { term: 'Fall 2025', course_code: 'CST2335', course_en: 'Mobile Application Development', course_ar: 'تطوير تطبيقات الجوال', credits: 3, grade: 'A-', points: 3.7 },
      { term: 'Fall 2025', course_code: 'CST8288', course_en: 'Object-Oriented Programming', course_ar: 'البرمجة الكائنية', credits: 3, grade: 'B+', points: 3.3 },
      { term: 'Winter 2025', course_code: 'CST8109', course_en: 'Network Programming', course_ar: 'برمجة الشبكات', credits: 3, grade: 'A', points: 4.0 },
      { term: 'Winter 2025', course_code: 'MAT2384', course_en: 'Discrete Mathematics', course_ar: 'الرياضيات المتقطعة', credits: 3, grade: 'B+', points: 3.3 },
    ],
    warnings: [],
    holds: [],
    lms_courses: [
      { course_code: 'CST2234', course_en: 'Web Programming', course_ar: 'برمجة الويب', attendance_rate: 96, assignments_submitted: 8, assignments_total: 8, current_score: 92, midterm_score: 90, final_score: 94, score_breakdown: breakdown(9, 19, 9, 90, 94), last_access: '2026-06-07T18:20:00Z' },
      { course_code: 'CST2335', course_en: 'Mobile Application Development', course_ar: 'تطوير تطبيقات الجوال', attendance_rate: 91, assignments_submitted: 6, assignments_total: 7, current_score: 88, midterm_score: 85, final_score: 89, score_breakdown: breakdown(8, 17, 9, 85, 89), last_access: '2026-06-06T10:05:00Z' },
      { course_code: 'CST8288', course_en: 'Object-Oriented Programming', course_ar: 'البرمجة الكائنية', attendance_rate: 89, assignments_submitted: 7, assignments_total: 8, current_score: 84, midterm_score: 80, final_score: 86, score_breakdown: breakdown(8, 16, 8, 80, 86), last_access: '2026-06-05T14:40:00Z' },
    ],
    app_last_login: '2026-06-08T07:45:00Z', app_logins_30d: 41, ai_conversations: 12,
    app_timeline: [
      { date: '2026-06-08T07:45:00Z', action_en: 'Checked Winter 2026 schedule', action_ar: 'اطلعت على جدول شتاء 2026', channel: 'app' },
      { date: '2026-06-06T19:10:00Z', action_en: 'Asked AI Advisor about course registration', action_ar: 'سألت المستشار الذكي عن التسجيل', channel: 'ai_advisor' },
      { date: '2026-06-03T12:30:00Z', action_en: 'Paid second tuition installment', action_ar: 'سددت القسط الثاني من الرسوم', channel: 'app' },
      { date: '2026-05-29T09:00:00Z', action_en: 'Submitted enrollment letter request', action_ar: 'قدمت طلب إفادة قيد', channel: 'app' },
    ],
    requests: [
      { id: 'FCL-2026-020', type_en: 'Enrollment Letter', type_ar: 'إفادة قيد', status: 'in_progress', submitted_at: '2026-05-15T08:15:00Z' },
    ],
    finance: { balance: 412.5, total_payable: 825, paid_amount: 412.5, late_fee: 0, standing: 'on_track' },
  },
  {
    id: '20211045', student_number: '20211045', national_id: '300050901122',
    name_en: 'Yousef Al-Mutairi', name_ar: 'يوسف المطيري',
    email: '20211045@stu.cck.edu.kw', phone: '+965 6655 1098',
    address_en: 'Jahra, Block 1, Street 4, House 17', address_ar: 'الجهراء، قطعة 1، شارع 4، منزل 17',
    program_en: 'BBA in Accounting', program_ar: 'بكالوريوس المحاسبة',
    level: 'bachelor', cohort_year: 2021, enrollment_status: 'enrolled',
    academic_standing_en: GOOD_EN, academic_standing_ar: GOOD_AR,
    gpa_cumulative: 3.1, gpa_term: 3.0, credits_completed: 108, credits_required: 126,
    advisor_en: 'Dr. Layla Al-Rashid', advisor_ar: 'د. ليلى الرشيد', funding: 'puc',
    gpa_history: [
      { term: 'Fall 2024', gpa: 3.05, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Winter 2025', gpa: 3.2, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Fall 2025', gpa: 3.0, credits: 12, status_en: GOOD_EN, status_ar: GOOD_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'ACC3100', course_en: 'Intermediate Accounting', course_ar: 'محاسبة متوسطة', credits: 3, grade: 'B', points: 3.0 },
      { term: 'Fall 2025', course_code: 'ACC3200', course_en: 'Cost Accounting', course_ar: 'محاسبة التكاليف', credits: 3, grade: 'B+', points: 3.3 },
      { term: 'Fall 2025', course_code: 'FIN3000', course_en: 'Corporate Finance', course_ar: 'التمويل المؤسسي', credits: 3, grade: 'A-', points: 3.7 },
      { term: 'Winter 2025', course_code: 'ACC2200', course_en: 'Managerial Accounting', course_ar: 'المحاسبة الإدارية', credits: 3, grade: 'B', points: 3.0 },
    ],
    warnings: [],
    holds: [],
    lms_courses: [
      { course_code: 'ACC3100', course_en: 'Intermediate Accounting', course_ar: 'محاسبة متوسطة', attendance_rate: 84, assignments_submitted: 5, assignments_total: 6, current_score: 79, midterm_score: 75, final_score: 80, score_breakdown: breakdown(7, 15, 8, 75, 80), last_access: '2026-06-07T20:00:00Z' },
      { course_code: 'FIN3000', course_en: 'Corporate Finance', course_ar: 'التمويل المؤسسي', attendance_rate: 90, assignments_submitted: 6, assignments_total: 6, current_score: 86, midterm_score: 84, final_score: 88, score_breakdown: breakdown(8, 18, 9, 84, 88), last_access: '2026-06-07T16:30:00Z' },
    ],
    app_last_login: '2026-06-07T21:05:00Z', app_logins_30d: 23, ai_conversations: 4,
    app_timeline: [
      { date: '2026-06-07T21:05:00Z', action_en: 'Viewed expected graduation audit', action_ar: 'اطلع على تدقيق التخرج المتوقع', channel: 'app' },
      { date: '2026-06-01T11:00:00Z', action_en: 'Submitted graduation clearance request', action_ar: 'قدم طلب إخلاء طرف للتخرج', channel: 'app' },
      { date: '2026-05-22T13:15:00Z', action_en: 'Downloaded unofficial transcript', action_ar: 'حمّل كشف درجات غير رسمي', channel: 'web' },
    ],
    requests: [
      { id: 'FCL-2026-018', type_en: 'Graduation Clearance', type_ar: 'إخلاء طرف للتخرج', status: 'in_progress', submitted_at: '2026-05-12T09:00:00Z' },
      { id: 'REQ-2026-0331', type_en: 'Expected Graduation Letter', type_ar: 'إفادة تخرج متوقع', status: 'completed', submitted_at: '2026-04-02T10:00:00Z' },
    ],
    finance: { balance: 0, total_payable: 1240, paid_amount: 1240, late_fee: 0, standing: 'cleared' },
  },
  {
    id: '20230077', student_number: '20230077', national_id: '302110800456',
    name_en: 'Dana Al-Otaibi', name_ar: 'دانة العتيبي',
    email: '20230077@stu.cck.edu.kw', phone: '+965 5009 7732',
    address_en: 'Mishref, Block 6, Street 9, House 30', address_ar: 'مشرف، قطعة 6، شارع 9، منزل 30',
    program_en: 'Diploma in Marketing', program_ar: 'دبلوم التسويق',
    level: 'diploma', cohort_year: 2023, enrollment_status: 'probation',
    academic_standing_en: PROB_EN, academic_standing_ar: PROB_AR,
    gpa_cumulative: 1.85, gpa_term: 1.6, credits_completed: 33, credits_required: 66,
    advisor_en: 'Dalal Al-Fadhli', advisor_ar: 'دلال الفضلي', funding: 'self',
    gpa_history: [
      { term: 'Fall 2024', gpa: 2.4, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Winter 2025', gpa: 2.0, credits: 12, status_en: WARN_EN, status_ar: WARN_AR },
      { term: 'Fall 2025', gpa: 1.6, credits: 12, status_en: PROB_EN, status_ar: PROB_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'MKT2100', course_en: 'Principles of Marketing', course_ar: 'مبادئ التسويق', credits: 3, grade: 'D', points: 1.0 },
      { term: 'Fall 2025', course_code: 'MKT2200', course_en: 'Consumer Behaviour', course_ar: 'سلوك المستهلك', credits: 3, grade: 'C-', points: 1.7 },
      { term: 'Fall 2025', course_code: 'BUS1100', course_en: 'Business Communication', course_ar: 'الاتصال التجاري', credits: 3, grade: 'F', points: 0.0 },
      { term: 'Winter 2025', course_code: 'MKT2100', course_en: 'Principles of Marketing', course_ar: 'مبادئ التسويق', credits: 3, grade: 'D+', points: 1.3 },
    ],
    warnings: [
      { id: 'AW-2026-014', type_en: 'GPA below 2.0', type_ar: 'المعدل أقل من 2.0', severity: 'critical', term: 'Fall 2025', date: '2026-01-20', detail_en: 'Cumulative GPA fell to 1.85 - placed on academic probation.', detail_ar: 'انخفض المعدل التراكمي إلى 1.85 ووُضعت تحت المراقبة الأكاديمية.', status: 'active' },
      { id: 'AW-2026-009', type_en: 'Attendance warning', type_ar: 'إنذار غياب', severity: 'warning', term: 'Fall 2025', date: '2025-11-30', detail_en: 'Exceeded 25% absence threshold in BUS1100.', detail_ar: 'تجاوزت حد الغياب 25% في مادة BUS1100.', status: 'active' },
      { id: 'AW-2025-061', type_en: 'Missing assignments', type_ar: 'واجبات غير مسلّمة', severity: 'info', term: 'Winter 2025', date: '2025-04-10', detail_en: '3 assignments not submitted in MKT2100.', detail_ar: 'لم تُسلَّم 3 واجبات في مادة MKT2100.', status: 'resolved' },
    ],
    holds: [
      { type_en: 'Financial Hold', type_ar: 'إيقاف مالي', reason_en: 'Outstanding balance and late registration fee.', reason_ar: 'رصيد مستحق ورسوم تسجيل متأخر.', placed_by_en: 'Finance Department', placed_by_ar: 'الإدارة المالية', date: '2026-05-14', active: true },
      { type_en: 'Advising Hold', type_ar: 'إيقاف إرشادي', reason_en: 'Must meet advisor before Winter 2026 registration.', reason_ar: 'يجب مقابلة المرشد قبل تسجيل شتاء 2026.', placed_by_en: 'Dalal Al-Fadhli', placed_by_ar: 'دلال الفضلي', date: '2026-05-02', active: true },
    ],
    lms_courses: [
      { course_code: 'MKT2100', course_en: 'Principles of Marketing', course_ar: 'مبادئ التسويق', attendance_rate: 61, assignments_submitted: 4, assignments_total: 7, current_score: 58, midterm_score: 55, final_score: 57, score_breakdown: breakdown(5, 11, 6, 55, 57), last_access: '2026-05-30T09:15:00Z' },
      { course_code: 'BUS1100', course_en: 'Business Communication', course_ar: 'الاتصال التجاري', attendance_rate: 48, assignments_submitted: 2, assignments_total: 6, current_score: 41, midterm_score: 44, final_score: 38, score_breakdown: breakdown(3, 8, 4, 44, 38), last_access: '2026-05-21T11:40:00Z' },
    ],
    app_last_login: '2026-06-02T16:20:00Z', app_logins_30d: 6, ai_conversations: 9,
    app_timeline: [
      { date: '2026-06-02T16:20:00Z', action_en: 'Asked AI Advisor about withdrawal options', action_ar: 'سألت المستشار الذكي عن خيارات الانسحاب', channel: 'ai_advisor' },
      { date: '2026-05-14T11:30:00Z', action_en: 'Submitted semester withdrawal request', action_ar: 'قدمت طلب انسحاب من الفصل', channel: 'app' },
      { date: '2026-05-10T08:50:00Z', action_en: 'Viewed financial hold notice', action_ar: 'اطلعت على إشعار الإيقاف المالي', channel: 'app' },
    ],
    requests: [
      { id: 'FCL-2026-019', type_en: 'Semester Withdrawal', type_ar: 'انسحاب من الفصل', status: 'in_progress', submitted_at: '2026-05-14T11:30:00Z' },
    ],
    finance: { balance: 487.5, total_payable: 825, paid_amount: 337.5, late_fee: 5, standing: 'hold' },
  },
  {
    id: '20250203', student_number: '20250203', national_id: '307030500991',
    name_en: 'Faisal Al-Rashidi', name_ar: 'فيصل الرشيدي',
    email: '20250203@stu.cck.edu.kw', phone: '+965 9914 0327',
    address_en: 'Bayan, Block 5, Street 11, House 19', address_ar: 'بيان، قطعة 5، شارع 11، منزل 19',
    program_en: 'BASc in Computer Science', program_ar: 'بكالوريوس علوم الحاسوب',
    level: 'bachelor', cohort_year: 2025, enrollment_status: 'enrolled',
    academic_standing_en: GOOD_EN, academic_standing_ar: GOOD_AR,
    gpa_cumulative: 2.95, gpa_term: 2.95, credits_completed: 15, credits_required: 126,
    advisor_en: 'Dr. Omar Al-Barno', advisor_ar: 'د. عمر البرنو', funding: 'puc',
    gpa_history: [
      { term: 'Fall 2025', gpa: 2.95, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'CST1101', course_en: 'Introduction to Programming', course_ar: 'مقدمة في البرمجة', credits: 3, grade: 'B+', points: 3.3 },
      { term: 'Fall 2025', course_code: 'MAT1100', course_en: 'Calculus I', course_ar: 'التفاضل والتكامل 1', credits: 3, grade: 'C+', points: 2.3 },
      { term: 'Fall 2025', course_code: 'ENG1100', course_en: 'English Composition', course_ar: 'الكتابة الإنجليزية', credits: 3, grade: 'B', points: 3.0 },
    ],
    warnings: [
      { id: 'AW-2026-022', type_en: 'Midterm alert', type_ar: 'تنبيه منتصف الفصل', severity: 'info', term: 'Fall 2025', date: '2025-10-25', detail_en: 'Below 60% on Calculus I midterm - referred to tutoring.', detail_ar: 'أقل من 60% في اختبار منتصف الفصل للتفاضل - أُحيل للدروس المساندة.', status: 'acknowledged' },
    ],
    holds: [],
    lms_courses: [
      { course_code: 'CST1101', course_en: 'Introduction to Programming', course_ar: 'مقدمة في البرمجة', attendance_rate: 93, assignments_submitted: 7, assignments_total: 7, current_score: 87, midterm_score: 85, final_score: 88, score_breakdown: breakdown(9, 18, 9, 85, 88), last_access: '2026-06-08T09:30:00Z' },
      { course_code: 'MAT1100', course_en: 'Calculus I', course_ar: 'التفاضل والتكامل 1', attendance_rate: 80, assignments_submitted: 5, assignments_total: 7, current_score: 68, midterm_score: 58, final_score: 72, score_breakdown: breakdown(6, 13, 7, 58, 72), last_access: '2026-06-05T17:10:00Z' },
    ],
    app_last_login: '2026-06-08T09:30:00Z', app_logins_30d: 34, ai_conversations: 7,
    app_timeline: [
      { date: '2026-06-08T09:30:00Z', action_en: 'Booked tutoring session for Calculus I', action_ar: 'حجز جلسة دروس مساندة للتفاضل', channel: 'app' },
      { date: '2026-06-04T15:45:00Z', action_en: 'Asked AI Advisor about study tips', action_ar: 'سأل المستشار الذكي عن نصائح للدراسة', channel: 'ai_advisor' },
      { date: '2026-05-28T08:20:00Z', action_en: 'Joined Computer Science Club', action_ar: 'انضم إلى نادي علوم الحاسوب', channel: 'app' },
    ],
    requests: [],
    finance: { balance: 620, total_payable: 1240, paid_amount: 620, late_fee: 0, standing: 'on_track' },
  },
  {
    id: '20230455', student_number: '20230455', national_id: '302091100733',
    name_en: 'Sara Al-Hajri', name_ar: 'سارة الهاجري',
    email: '20230455@stu.cck.edu.kw', phone: '+965 9087 6614',
    address_en: 'Adailiya, Block 4, Street 6, House 14', address_ar: 'العديلية، قطعة 4، شارع 6، منزل 14',
    program_en: 'BBA in Management & Entrepreneurship', program_ar: 'بكالوريوس الإدارة وريادة الأعمال',
    level: 'bachelor', cohort_year: 2023, enrollment_status: 'enrolled',
    academic_standing_en: WARN_EN, academic_standing_ar: WARN_AR,
    gpa_cumulative: 2.3, gpa_term: 2.1, credits_completed: 60, credits_required: 126,
    advisor_en: 'Dr. Layla Al-Rashid', advisor_ar: 'د. ليلى الرشيد', funding: 'puc',
    gpa_history: [
      { term: 'Fall 2024', gpa: 2.6, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Winter 2025', gpa: 2.4, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Fall 2025', gpa: 2.1, credits: 15, status_en: WARN_EN, status_ar: WARN_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'MGT3100', course_en: 'Organizational Behaviour', course_ar: 'السلوك التنظيمي', credits: 3, grade: 'C', points: 2.0 },
      { term: 'Fall 2025', course_code: 'ENT3200', course_en: 'New Venture Creation', course_ar: 'تأسيس المشاريع الناشئة', credits: 3, grade: 'C+', points: 2.3 },
      { term: 'Fall 2025', course_code: 'MGT3300', course_en: 'Operations Management', course_ar: 'إدارة العمليات', credits: 3, grade: 'C-', points: 1.7 },
      { term: 'Winter 2025', course_code: 'MGT2100', course_en: 'Principles of Management', course_ar: 'مبادئ الإدارة', credits: 3, grade: 'B-', points: 2.7 },
    ],
    warnings: [
      { id: 'AW-2026-018', type_en: 'GPA warning', type_ar: 'إنذار معدل', severity: 'warning', term: 'Fall 2025', date: '2026-01-18', detail_en: 'Term GPA dropped to 2.1 - first academic warning issued.', detail_ar: 'انخفض معدل الفصل إلى 2.1 وصدر أول إنذار أكاديمي.', status: 'active' },
    ],
    holds: [
      { type_en: 'Financial Hold', type_ar: 'إيقاف مالي', reason_en: 'Tuition installment overdue and late fee unpaid.', reason_ar: 'قسط الرسوم متأخر ورسوم التأخير غير مسددة.', placed_by_en: 'Finance Department', placed_by_ar: 'الإدارة المالية', date: '2026-05-09', active: true },
    ],
    lms_courses: [
      { course_code: 'MGT3100', course_en: 'Organizational Behaviour', course_ar: 'السلوك التنظيمي', attendance_rate: 76, assignments_submitted: 5, assignments_total: 7, current_score: 71, midterm_score: 68, final_score: 73, score_breakdown: breakdown(7, 14, 7, 68, 73), last_access: '2026-06-06T13:00:00Z' },
      { course_code: 'MGT3300', course_en: 'Operations Management', course_ar: 'إدارة العمليات', attendance_rate: 69, assignments_submitted: 4, assignments_total: 7, current_score: 63, midterm_score: 60, final_score: 64, score_breakdown: breakdown(6, 12, 6, 60, 64), last_access: '2026-06-04T19:25:00Z' },
    ],
    app_last_login: '2026-06-06T13:05:00Z', app_logins_30d: 17, ai_conversations: 5,
    app_timeline: [
      { date: '2026-06-06T13:05:00Z', action_en: 'Viewed academic warning notice', action_ar: 'اطلعت على إشعار الإنذار الأكاديمي', channel: 'app' },
      { date: '2026-05-20T10:10:00Z', action_en: 'Opened payment portal - saw overdue balance', action_ar: 'فتحت بوابة الدفع وشاهدت الرصيد المتأخر', channel: 'app' },
      { date: '2026-05-09T14:20:00Z', action_en: 'Submitted enrollment letter request', action_ar: 'قدمت طلب إفادة قيد', channel: 'app' },
    ],
    requests: [
      { id: 'FCL-2026-016', type_en: 'Enrollment Letter', type_ar: 'إفادة قيد', status: 'rejected', submitted_at: '2026-05-09T14:20:00Z' },
    ],
    finance: { balance: 643.13, total_payable: 1240, paid_amount: 596.87, late_fee: 5, standing: 'hold' },
  },
  {
    id: '20220612', student_number: '20220612', national_id: '301120700318',
    name_en: 'Abdullah Al-Failakawi', name_ar: 'عبدالله الفيلكاوي',
    email: '20220612@stu.cck.edu.kw', phone: '+965 5524 8801',
    address_en: 'Salwa, Block 8, Street 3, House 5', address_ar: 'سلوى، قطعة 8، شارع 3، منزل 5',
    program_en: 'Diploma in Computer Programming', program_ar: 'دبلوم برمجة الحاسوب',
    level: 'diploma', cohort_year: 2022, enrollment_status: 'enrolled',
    academic_standing_en: GOOD_EN, academic_standing_ar: GOOD_AR,
    gpa_cumulative: 3.62, gpa_term: 3.8, credits_completed: 54, credits_required: 66,
    advisor_en: 'Dr. Omar Al-Barno', advisor_ar: 'د. عمر البرنو', funding: 'self',
    gpa_history: [
      { term: 'Fall 2024', gpa: 3.5, credits: 15, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Winter 2025', gpa: 3.6, credits: 12, status_en: GOOD_EN, status_ar: GOOD_AR },
      { term: 'Fall 2025', gpa: 3.8, credits: 12, status_en: GOOD_EN, status_ar: GOOD_AR },
    ],
    transcript: [
      { term: 'Fall 2025', course_code: 'CST8288', course_en: 'Object-Oriented Programming', course_ar: 'البرمجة الكائنية', credits: 3, grade: 'A', points: 4.0 },
      { term: 'Fall 2025', course_code: 'CST8109', course_en: 'Network Programming', course_ar: 'برمجة الشبكات', credits: 3, grade: 'A', points: 4.0 },
      { term: 'Fall 2025', course_code: 'CST8283', course_en: 'Programming in Java', course_ar: 'البرمجة بلغة جافا', credits: 3, grade: 'A-', points: 3.7 },
      { term: 'Winter 2025', course_code: 'CST2335', course_en: 'Mobile Application Development', course_ar: 'تطوير تطبيقات الجوال', credits: 3, grade: 'A', points: 4.0 },
    ],
    warnings: [],
    holds: [],
    lms_courses: [
      { course_code: 'CST8288', course_en: 'Object-Oriented Programming', course_ar: 'البرمجة الكائنية', attendance_rate: 98, assignments_submitted: 8, assignments_total: 8, current_score: 95, midterm_score: 94, final_score: 96, score_breakdown: breakdown(10, 20, 10, 94, 96), last_access: '2026-06-08T11:00:00Z' },
      { course_code: 'CST8283', course_en: 'Programming in Java', course_ar: 'البرمجة بلغة جافا', attendance_rate: 94, assignments_submitted: 7, assignments_total: 7, current_score: 91, midterm_score: 89, final_score: 93, score_breakdown: breakdown(9, 19, 9, 89, 93), last_access: '2026-06-07T22:15:00Z' },
    ],
    app_last_login: '2026-06-08T11:02:00Z', app_logins_30d: 38, ai_conversations: 3,
    app_timeline: [
      { date: '2026-06-08T11:02:00Z', action_en: 'Registered for Winter 2026 courses', action_ar: 'سجّل مواد شتاء 2026', channel: 'app' },
      { date: '2026-06-01T18:40:00Z', action_en: 'Checked sport scholarship discount', action_ar: 'تحقق من خصم المنحة الرياضية', channel: 'app' },
      { date: '2026-05-25T20:30:00Z', action_en: 'Posted in Student Workers Club feed', action_ar: 'نشر في موجز نادي الطلبة العاملين', channel: 'app' },
    ],
    requests: [
      { id: 'FCL-2026-015', type_en: 'Graduation Clearance', type_ar: 'إخلاء طرف للتخرج', status: 'completed', submitted_at: '2026-05-08T10:00:00Z' },
    ],
    finance: { balance: 0, total_payable: 660, paid_amount: 660, late_fee: 0, standing: 'cleared' },
  },
];

export function toDirectoryEntry(s: StudentRecord): StudentDirectoryEntry {
  return {
    id: s.id,
    student_number: s.student_number,
    name_en: s.name_en,
    name_ar: s.name_ar,
    program_en: s.program_en,
    program_ar: s.program_ar,
    level: s.level,
    cohort_year: s.cohort_year,
    enrollment_status: s.enrollment_status,
    gpa_cumulative: s.gpa_cumulative,
    active_warnings: s.warnings.filter((w) => w.status === 'active').length,
    active_holds: s.holds.filter((h) => h.active).length,
    balance: s.finance.balance,
  };
}
