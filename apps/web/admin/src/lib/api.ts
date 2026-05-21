// Mock data - MVP standalone, no backend required

import {
  EQUIVALENCY, PAAET_EQUIVALENCY, EQUIVALENCY_RULES,
  calcTuition, STANDARD_GRANT_RATE, SPORT_DISCOUNT_RATE,
  MISC_FEES_KWD, INSTALLMENT_WEEKS,
  type ProgramTrack, type PaymentMethod,
} from '@masari/shared';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Wraps an async API call with user-friendly error handling. */
async function withErrorHandling<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`[${label}] Request failed: ${message}`);
  }
}

const ENGAGEMENT = {
  daily_active_users: 2450,
  monthly_active_users: 4200,
  avg_session_duration_minutes: 23.5,
  feature_usage_heatmap: {
    schedule_view: { usage_count: 3820, label_ar: 'عرض الجدول', label_en: 'Schedule View' },
    grade_check: { usage_count: 2950, label_ar: 'التحقق من الدرجات', label_en: 'Grade Check' },
    payment_portal: { usage_count: 1870, label_ar: 'بوابة الدفع', label_en: 'Payment Portal' },
    ai_advisor: { usage_count: 1540, label_ar: 'المستشار الذكي', label_en: 'AI Advisor' },
    campus_events: { usage_count: 1320, label_ar: 'فعاليات الحرم', label_en: 'Campus Events' },
    social_feed: { usage_count: 2100, label_ar: 'المنشورات', label_en: 'Social Feed' },
    library_search: { usage_count: 980, label_ar: 'بحث المكتبة', label_en: 'Library Search' },
    club_activities: { usage_count: 760, label_ar: 'أنشطة الأندية', label_en: 'Club Activities' },
  },
  engagement_by_cohort: [
    { cohort: '2023', active_users: 1050, avg_session_min: 26.1 },
    { cohort: '2024', active_users: 1380, avg_session_min: 24.3 },
    { cohort: '2025', active_users: 920, avg_session_min: 21.8 },
    { cohort: '2026', active_users: 850, avg_session_min: 19.5 },
  ],
  engagement_by_major: [
    { major_en: 'Computer Science', major_ar: 'علوم الحاسب', active_users: 820, avg_session_min: 28.4 },
    { major_en: 'Engineering', major_ar: 'الهندسة', active_users: 710, avg_session_min: 25.1 },
    { major_en: 'Business', major_ar: 'إدارة الأعمال', active_users: 680, avg_session_min: 22.7 },
    { major_en: 'Science', major_ar: 'العلوم', active_users: 450, avg_session_min: 20.3 },
    { major_en: 'Arts', major_ar: 'الآداب', active_users: 390, avg_session_min: 18.9 },
  ],
  engagement_by_year: [
    { year: '1st Year', year_ar: 'السنة الأولى', active_users: 1100, avg_session_min: 19.2 },
    { year: '2nd Year', year_ar: 'السنة الثانية', active_users: 980, avg_session_min: 22.5 },
    { year: '3rd Year', year_ar: 'السنة الثالثة', active_users: 870, avg_session_min: 25.8 },
    { year: '4th Year', year_ar: 'السنة الرابعة', active_users: 650, avg_session_min: 27.1 },
    { year: '5th Year', year_ar: 'السنة الخامسة', active_users: 350, avg_session_min: 23.4 },
  ],
  peak_hours: [
    { hour: 9, users: 1200, label_ar: '٩ صباحاً', label_en: '9 AM' },
    { hour: 13, users: 1850, label_ar: '١ ظهراً', label_en: '1 PM' },
    { hour: 21, users: 1650, label_ar: '٩ مساءً', label_en: '9 PM' },
  ],
  period: { start: '2026-03-08', end: '2026-04-08' },
};

const RETENTION = {
  overall_retention_rate: 94.2,
  at_risk_students_count: 47,
  total_enrolled: 4200,
  retention_by_college: [
    { college_ar: 'كلية علوم الحاسب', college_en: 'College of Computer Science', retention_rate: 96.1, enrolled: 820 },
    { college_ar: 'كلية الهندسة', college_en: 'College of Engineering', retention_rate: 93.8, enrolled: 950 },
    { college_ar: 'كلية إدارة الأعمال', college_en: 'College of Business', retention_rate: 94.5, enrolled: 1100 },
    { college_ar: 'كلية العلوم', college_en: 'College of Science', retention_rate: 92.3, enrolled: 680 },
    { college_ar: 'كلية الآداب', college_en: 'College of Arts', retention_rate: 95.0, enrolled: 650 },
  ],
  trend: [
    { month: '2026-01', rate: 95.1 },
    { month: '2026-02', rate: 94.8 },
    { month: '2026-03', rate: 94.5 },
    { month: '2026-04', rate: 94.2 },
  ],
};

const AT_RISK_STUDENTS = [
  {
    id: 'student_401',
    name_ar: 'محمد العتيبي',
    name_en: 'Mohammed Al-Otaibi',
    student_id: '441012345',
    risk_score: 0.85,
    risk_level: 'high',
    college_ar: 'كلية علوم الحاسب',
    college_en: 'College of Computer Science',
    gpa: 1.8,
    contributing_factors: [
      { factor_ar: 'انخفاض حاد في المعدل التراكمي', factor_en: 'Sharp GPA decline', weight: 0.4 },
      { factor_ar: 'غياب متكرر في آخر ٣ أسابيع', factor_en: 'Frequent absences in last 3 weeks', weight: 0.3 },
      { factor_ar: 'عدم تسليم ٤ واجبات', factor_en: '4 missing assignments', weight: 0.15 },
    ],
    last_active: '2026-04-02T14:30:00Z',
  },
  {
    id: 'student_402',
    name_ar: 'سارة الدوسري',
    name_en: 'Sarah Al-Dosari',
    student_id: '441023456',
    risk_score: 0.78,
    risk_level: 'high',
    college_ar: 'كلية الهندسة',
    college_en: 'College of Engineering',
    gpa: 2.1,
    contributing_factors: [
      { factor_ar: 'تأخر في سداد الرسوم الدراسية', factor_en: 'Overdue tuition payment', weight: 0.35 },
      { factor_ar: 'انخفاض التفاعل مع المنصة', factor_en: 'Decreased platform engagement', weight: 0.25 },
      { factor_ar: 'رسوب في مادتين', factor_en: 'Failed 2 courses', weight: 0.18 },
    ],
    last_active: '2026-04-05T09:00:00Z',
  },
  {
    id: 'student_403',
    name_ar: 'خالد الشمري',
    name_en: 'Khalid Al-Shammari',
    student_id: '441034567',
    risk_score: 0.72,
    risk_level: 'medium',
    college_ar: 'كلية إدارة الأعمال',
    college_en: 'College of Business',
    gpa: 2.3,
    contributing_factors: [
      { factor_ar: 'انسحاب من مادتين هذا الفصل', factor_en: 'Withdrew from 2 courses this semester', weight: 0.3 },
      { factor_ar: 'انخفاض في درجات الاختبارات', factor_en: 'Declining exam scores', weight: 0.25 },
    ],
    last_active: '2026-04-07T16:45:00Z',
  },
  {
    id: 'student_404',
    name_ar: 'ريم الحربي',
    name_en: 'Reem Al-Harbi',
    student_id: '441045678',
    risk_score: 0.65,
    risk_level: 'medium',
    college_ar: 'كلية العلوم',
    college_en: 'College of Science',
    gpa: 2.5,
    contributing_factors: [
      { factor_ar: 'غياب عن ٣ اختبارات قصيرة', factor_en: 'Missed 3 quizzes', weight: 0.3 },
      { factor_ar: 'عدم حضور ساعات الإرشاد', factor_en: 'No advising session attendance', weight: 0.2 },
    ],
    last_active: '2026-04-06T11:20:00Z',
  },
  {
    id: 'student_405',
    name_ar: 'عمر المالكي',
    name_en: 'Omar Al-Malki',
    student_id: '441056789',
    risk_score: 0.61,
    risk_level: 'medium',
    college_ar: 'كلية الآداب',
    college_en: 'College of Arts',
    gpa: 2.4,
    contributing_factors: [
      { factor_ar: 'تراجع في الأداء الأكاديمي', factor_en: 'Academic performance decline', weight: 0.25 },
      { factor_ar: 'قلة التفاعل في المنتديات الدراسية', factor_en: 'Low participation in course forums', weight: 0.2 },
      { factor_ar: 'تأخر في تسليم المشاريع', factor_en: 'Late project submissions', weight: 0.16 },
    ],
    last_active: '2026-04-07T08:30:00Z',
  },
];

const ADMIN_USERS = [
  {
    id: 'admin_001',
    email: 'dean@ksu.edu.sa',
    name_ar: 'د. عبدالله الفيصل',
    name_en: 'Dr. Abdullah Al-Faisal',
    role: 'super_admin',
    status: 'active',
    created_at: '2025-09-01T00:00:00Z',
    last_login: '2026-04-08T08:30:00Z',
  },
  {
    id: 'admin_002',
    email: 'registrar@ksu.edu.sa',
    name_ar: 'نورة الشهري',
    name_en: 'Noura Al-Shahri',
    role: 'university_admin',
    status: 'active',
    created_at: '2025-09-15T00:00:00Z',
    last_login: '2026-04-07T14:20:00Z',
  },
  {
    id: 'admin_003',
    email: 'advisor.cs@ksu.edu.sa',
    name_ar: 'أحمد الغامدي',
    name_en: 'Ahmed Al-Ghamdi',
    role: 'advisor',
    status: 'active',
    created_at: '2025-10-01T00:00:00Z',
    last_login: '2026-04-08T10:15:00Z',
  },
];

const STUDENT_PROFILES: Record<string, object> = {
  student_401: {
    id: 'student_401', name_en: 'Mohammed Al-Otaibi', name_ar: 'محمد العتيبي', student_id: '441012345',
    email: 'm.otaibi@students.ksu.edu.sa', risk_score: 0.85, risk_level: 'high',
    college_en: 'College of Computer Science', major_en: 'Software Engineering', year: '3rd Year', gpa: 1.8,
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', email: 'advisor.cs@ksu.edu.sa' },
    contributing_factors: [
      { factor_en: 'Sharp GPA decline', weight: 0.4 },
      { factor_en: 'Frequent absences in last 3 weeks', weight: 0.3 },
      { factor_en: '4 missing assignments', weight: 0.15 },
    ],
    academic_history: [
      { semester: 'Fall 2024', gpa: 3.2, credits: 15, status: 'Good Standing' },
      { semester: 'Spring 2025', gpa: 2.6, credits: 15, status: 'Good Standing' },
      { semester: 'Fall 2025', gpa: 2.1, credits: 12, status: 'Warning' },
      { semester: 'Spring 2026', gpa: 1.8, credits: 12, status: 'Probation' },
    ],
    attendance: [
      { course: 'CS301 - Software Engineering', attended: 8, total: 14, rate: 57 },
      { course: 'CS310 - Database Systems', attended: 10, total: 14, rate: 71 },
      { course: 'CS350 - Networks', attended: 12, total: 14, rate: 86 },
      { course: 'MATH301 - Linear Algebra', attended: 6, total: 14, rate: 43 },
    ],
    payment_status: [
      { item: 'Tuition - Spring 2026', amount: 22500, status: 'Paid', due_date: '2026-01-15' },
      { item: 'Lab Fees', amount: 1500, status: 'Paid', due_date: '2026-01-15' },
      { item: 'Late Registration Fee', amount: 500, status: 'Overdue', due_date: '2026-03-01' },
    ],
    engagement_timeline: [
      { date: 'Apr 2', action: 'Last app login' },
      { date: 'Apr 1', action: 'Viewed grade for CS301' },
      { date: 'Mar 28', action: 'Opened AI Advisor - asked about withdrawal' },
      { date: 'Mar 25', action: 'Checked payment balance' },
      { date: 'Mar 20', action: 'Viewed schedule' },
      { date: 'Mar 15', action: 'Last LMS login (Blackboard)' },
    ],
    interventions: [
      { date: '2026-03-10', type: 'Schedule Meeting', advisor: 'Ahmed Al-Ghamdi', outcome: 'Ongoing', notes: 'Student agreed to attend tutoring sessions' },
      { date: '2026-02-15', type: 'Send In-App Message', advisor: 'Ahmed Al-Ghamdi', outcome: 'Resolved', notes: 'Reminded about missing assignments, submitted 2 of 4' },
    ],
  },
  student_402: {
    id: 'student_402', name_en: 'Sarah Al-Dosari', name_ar: 'سارة الدوسري', student_id: '441023456',
    email: 's.dosari@students.ksu.edu.sa', risk_score: 0.78, risk_level: 'high',
    college_en: 'College of Engineering', major_en: 'Civil Engineering', year: '4th Year', gpa: 2.1,
    assigned_advisor: { name_en: 'Fatima Al-Rashid', email: 'advisor.eng@ksu.edu.sa' },
    contributing_factors: [
      { factor_en: 'Overdue tuition payment', weight: 0.35 },
      { factor_en: 'Decreased platform engagement', weight: 0.25 },
      { factor_en: 'Failed 2 courses', weight: 0.18 },
    ],
    academic_history: [
      { semester: 'Fall 2024', gpa: 2.8, credits: 16, status: 'Good Standing' },
      { semester: 'Spring 2025', gpa: 2.5, credits: 15, status: 'Good Standing' },
      { semester: 'Fall 2025', gpa: 2.3, credits: 14, status: 'Warning' },
      { semester: 'Spring 2026', gpa: 2.1, credits: 12, status: 'Warning' },
    ],
    attendance: [
      { course: 'CE401 - Structural Analysis', attended: 11, total: 14, rate: 79 },
      { course: 'CE410 - Construction Mgmt', attended: 9, total: 14, rate: 64 },
      { course: 'CE450 - Capstone Project', attended: 13, total: 14, rate: 93 },
    ],
    payment_status: [
      { item: 'Tuition - Spring 2026', amount: 24000, status: 'Overdue', due_date: '2026-01-15' },
      { item: 'Lab Fees', amount: 2000, status: 'Overdue', due_date: '2026-01-15' },
    ],
    engagement_timeline: [
      { date: 'Apr 5', action: 'Last app login' },
      { date: 'Apr 3', action: 'Checked payment - saw overdue notice' },
      { date: 'Mar 30', action: 'Viewed capstone project deadline' },
    ],
    interventions: [
      { date: '2026-03-20', type: 'Contact Parent/Guardian', advisor: 'Fatima Al-Rashid', outcome: 'Ongoing', notes: 'Discussed financial situation with family' },
    ],
  },
};

// Generate generic profile for students without detailed mock
function generateProfile(id: string) {
  const s = AT_RISK_STUDENTS.find((s) => s.id === id);
  if (!s) return null;
  return {
    ...s, email: `${id}@students.ksu.edu.sa`, major_en: 'General Studies', year: '2nd Year',
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', email: 'advisor.cs@ksu.edu.sa' },
    academic_history: [
      { semester: 'Fall 2025', gpa: 2.8, credits: 15, status: 'Good Standing' },
      { semester: 'Spring 2026', gpa: s.gpa, credits: 12, status: s.gpa < 2.0 ? 'Probation' : 'Warning' },
    ],
    attendance: [
      { course: 'GEN201 - Core Course', attended: 9, total: 14, rate: 64 },
      { course: 'GEN202 - Elective', attended: 11, total: 14, rate: 79 },
    ],
    payment_status: [{ item: 'Tuition - Spring 2026', amount: 20000, status: 'Paid', due_date: '2026-01-15' }],
    engagement_timeline: [
      { date: 'Apr 7', action: 'Last app login' },
      { date: 'Apr 5', action: 'Viewed schedule' },
    ],
    interventions: [],
  };
}

const AUDIT_LOG = [
  { id: 'log_001', timestamp: '2026-04-08T14:30:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Updated branding colors', resource: 'Branding Config', ip: '10.0.1.15' },
  { id: 'log_002', timestamp: '2026-04-08T12:15:00Z', admin_name: 'Noura Al-Shahri', action: 'Sent communication to all students', resource: 'Communications', ip: '10.0.1.22' },
  { id: 'log_003', timestamp: '2026-04-08T10:45:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Scheduled intervention for Mohammed Al-Otaibi', resource: 'Retention', ip: '10.0.1.35' },
  { id: 'log_004', timestamp: '2026-04-07T16:20:00Z', admin_name: 'Noura Al-Shahri', action: 'Imported 150 student records', resource: 'User Management', ip: '10.0.1.22' },
  { id: 'log_005', timestamp: '2026-04-07T14:00:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Changed role for admin_003 to advisor', resource: 'User Management', ip: '10.0.1.15' },
  { id: 'log_006', timestamp: '2026-04-07T11:30:00Z', admin_name: 'Noura Al-Shahri', action: 'Triggered manual data sync', resource: 'Integrations', ip: '10.0.1.22' },
  { id: 'log_007', timestamp: '2026-04-07T09:00:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Marked intervention as Resolved for student_402', resource: 'Retention', ip: '10.0.1.35' },
  { id: 'log_008', timestamp: '2026-04-06T15:45:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Approved club "Robotics Society"', resource: 'Content Management', ip: '10.0.1.15' },
  { id: 'log_009', timestamp: '2026-04-06T10:30:00Z', admin_name: 'Noura Al-Shahri', action: 'Exported student data (CSV)', resource: 'User Management', ip: '10.0.1.22' },
  { id: 'log_010', timestamp: '2026-04-05T13:15:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Sent communication to at-risk students', resource: 'Communications', ip: '10.0.1.35' },
];

const PAYMENT_ANALYTICS = {
  total_billed: 18900000,
  total_collected: 16632000,
  collection_rate: 88.0,
  outstanding_balance: 2268000,
  by_cohort: [
    { cohort: '2023', billed: 5200000, collected: 4940000, rate: 95.0 },
    { cohort: '2024', billed: 5100000, collected: 4692000, rate: 92.0 },
    { cohort: '2025', billed: 4800000, collected: 4080000, rate: 85.0 },
    { cohort: '2026', billed: 3800000, collected: 2920000, rate: 76.8 },
  ],
  // Payment methods accepted by CCK Finance: K-net, Visa, Mastercard, Cash
  // (Finance Department doc — Apple Pay & Mada are not accepted).
  by_method: [
    { method: 'payments.method.knet', count: 2840, amount: 9650000, percentage: 58.0 },
    { method: 'payments.method.visa', count: 1180, amount: 4120000, percentage: 24.8 },
    { method: 'payments.method.mastercard', count: 540, amount: 2150000, percentage: 12.9 },
    { method: 'payments.method.cash', count: 240, amount: 712000, percentage: 4.3 },
  ],
  // Outstanding balances grouped by CCK program track, not generic colleges.
  overdue_by_college: [
    { college: 'payments.program.bba', students: 45, amount: 720000 },
    { college: 'payments.program.diploma', students: 38, amount: 580000 },
    { college: 'payments.program.basc', students: 22, amount: 420000 },
    { college: 'payments.program.foundation', students: 18, amount: 310000 },
  ],
};

// ---------------------------------------------------------------------------
// Finance Department — student accounts, installments and clearances.
// Account figures are derived live from @masari/shared `calcTuition`, so the
// admin numbers match exactly what the student app payment portal shows.
// Sources: "Finance Department.docx", "Course Installment Details.xlsx",
// "CCK Registration & other fees, finance withdraw policy.pdf".
// ---------------------------------------------------------------------------

/** Study week the current semester sits in — drives installment due/overdue. */
const CURRENT_STUDY_WEEK = 8;

export type FinanceDiscount = 'grant' | 'sport' | 'none';

const FINANCE_DISCOUNT_RATE: Record<FinanceDiscount, number> = {
  grant: STANDARD_GRANT_RATE,
  sport: SPORT_DISCOUNT_RATE,
  none: 0,
};

interface FinanceStudentSeed {
  student_id: string;
  name_en: string;
  name_ar: string;
  email: string;
  phone: string;
  program_en: string;
  program_ar: string;
  track: ProgramTrack;
  level: 'diploma' | 'foundation' | 'bachelor';
  credits: number;
  discount: FinanceDiscount;
  /** Funding source — PUC-sponsored vs self-funded. */
  funding: 'puc' | 'self';
  /** Installments settled so far (0-3, due study weeks 4 / 8 / 12). */
  installments_paid: 0 | 1 | 2 | 3;
  method: PaymentMethod;
  /** 5 KWD late fee outstanding — blocks registration in the student app. */
  late_fee: boolean;
  /** Carrying a repeated course (Finance discount-exclusion rule). */
  repeated_course: boolean;
}

const FINANCE_STUDENTS: FinanceStudentSeed[] = [
  { student_id: '20240118', name_en: 'Noura Al-Shahri', name_ar: 'نورة الشهري',
    email: '20240118@stu.cck.edu.kw', phone: '+965 9012 4471',
    program_en: 'Diploma in Computer Programming', program_ar: 'دبلوم برمجة الحاسوب',
    track: 'diploma', level: 'diploma', credits: 15, discount: 'grant', funding: 'puc',
    installments_paid: 1, method: 'knet', late_fee: false, repeated_course: false },
  { student_id: '20211045', name_en: 'Yousef Al-Mutairi', name_ar: 'يوسف المطيري',
    email: '20211045@stu.cck.edu.kw', phone: '+965 6655 1098',
    program_en: 'BBA in Accounting', program_ar: 'بكالوريوس المحاسبة',
    track: 'bba_business', level: 'bachelor', credits: 12, discount: 'grant', funding: 'puc',
    installments_paid: 2, method: 'visa', late_fee: false, repeated_course: false },
  { student_id: '20230077', name_en: 'Dana Al-Otaibi', name_ar: 'دانة العتيبي',
    email: '20230077@stu.cck.edu.kw', phone: '+965 5009 7732',
    program_en: 'Diploma in Marketing', program_ar: 'دبلوم التسويق',
    track: 'diploma', level: 'diploma', credits: 15, discount: 'grant', funding: 'self',
    installments_paid: 0, method: 'knet', late_fee: true, repeated_course: true },
  { student_id: '20250203', name_en: 'Faisal Al-Rashidi', name_ar: 'فيصل الرشيدي',
    email: '20250203@stu.cck.edu.kw', phone: '+965 9914 0327',
    program_en: 'BASc in Computer Science', program_ar: 'بكالوريوس علوم الحاسوب',
    track: 'basc_computer', level: 'bachelor', credits: 12, discount: 'grant', funding: 'puc',
    installments_paid: 1, method: 'mastercard', late_fee: false, repeated_course: false },
  { student_id: '20240301', name_en: 'Maryam Al-Ajmi', name_ar: 'مريم العجمي',
    email: '20240301@stu.cck.edu.kw', phone: '+965 6701 4490',
    program_en: 'Foundation Program', program_ar: 'البرنامج التأسيسي',
    track: 'foundation', level: 'foundation', credits: 0, discount: 'grant', funding: 'puc',
    installments_paid: 1, method: 'knet', late_fee: false, repeated_course: false },
  { student_id: '20220612', name_en: 'Abdullah Al-Failakawi', name_ar: 'عبدالله الفيلكاوي',
    email: '20220612@stu.cck.edu.kw', phone: '+965 5524 8801',
    program_en: 'Diploma in Computer Programming', program_ar: 'دبلوم برمجة الحاسوب',
    track: 'diploma', level: 'diploma', credits: 12, discount: 'sport', funding: 'self',
    installments_paid: 1, method: 'cash', late_fee: false, repeated_course: false },
  { student_id: '20230455', name_en: 'Sara Al-Hajri', name_ar: 'سارة الهاجري',
    email: '20230455@stu.cck.edu.kw', phone: '+965 9087 6614',
    program_en: 'BBA in Management & Entrepreneurship', program_ar: 'بكالوريوس الإدارة وريادة الأعمال',
    track: 'bba_business', level: 'bachelor', credits: 15, discount: 'grant', funding: 'puc',
    installments_paid: 0, method: 'knet', late_fee: true, repeated_course: false },
  { student_id: '20250190', name_en: 'Hamad Al-Sabah', name_ar: 'حمد الصباح',
    email: '20250190@stu.cck.edu.kw', phone: '+965 6612 3358',
    program_en: 'Diploma in Accounting', program_ar: 'دبلوم المحاسبة',
    track: 'diploma', level: 'diploma', credits: 15, discount: 'grant', funding: 'self',
    installments_paid: 2, method: 'visa', late_fee: false, repeated_course: false },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

export type InstallmentStatus = 'paid' | 'due' | 'overdue' | 'upcoming';
export type AccountStanding = 'cleared' | 'on_track' | 'hold';

export interface FinanceInstallment {
  number: number;
  week: number;
  amount: number;
  status: InstallmentStatus;
}

export interface FinanceAccount {
  student_id: string;
  name_en: string;
  name_ar: string;
  email: string;
  phone: string;
  program_en: string;
  program_ar: string;
  level: 'diploma' | 'foundation' | 'bachelor';
  funding: 'puc' | 'self';
  discount: FinanceDiscount;
  method: PaymentMethod;
  credits: number;
  repeated_course: boolean;
  late_fee: boolean;
  late_fee_amount: number;
  total_payable: number;
  paid_amount: number;
  balance: number;
  installments: FinanceInstallment[];
  standing: AccountStanding;
}

function buildFinanceAccount(s: FinanceStudentSeed): FinanceAccount {
  const breakdown = calcTuition({
    credits: s.credits,
    track: s.track,
    level: s.level,
    discountRate: FINANCE_DISCOUNT_RATE[s.discount],
  });
  const installments: FinanceInstallment[] = breakdown.installments.map((inst) => {
    let status: InstallmentStatus;
    if (inst.number <= s.installments_paid) status = 'paid';
    else if (CURRENT_STUDY_WEEK > inst.week) status = 'overdue';
    else if (CURRENT_STUDY_WEEK >= inst.week - 1) status = 'due';
    else status = 'upcoming';
    return { number: inst.number, week: inst.week, amount: inst.amount, status };
  });
  const paidInstallments = breakdown.installments
    .slice(0, s.installments_paid)
    .reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = r2(breakdown.registrationFee + paidInstallments);
  const lateFeeAmount = s.late_fee ? MISC_FEES_KWD.late_registration : 0;
  const balance = r2(breakdown.totalPayable - paidAmount + lateFeeAmount);
  const hasOverdue = installments.some((i) => i.status === 'overdue');
  const standing: AccountStanding =
    balance <= 0 ? 'cleared' : hasOverdue || s.late_fee ? 'hold' : 'on_track';
  return {
    student_id: s.student_id,
    name_en: s.name_en,
    name_ar: s.name_ar,
    email: s.email,
    phone: s.phone,
    program_en: s.program_en,
    program_ar: s.program_ar,
    level: s.level,
    funding: s.funding,
    discount: s.discount,
    method: s.method,
    credits: s.credits,
    repeated_course: s.repeated_course,
    late_fee: s.late_fee,
    late_fee_amount: lateFeeAmount,
    total_payable: breakdown.totalPayable,
    paid_amount: paidAmount,
    balance,
    installments,
    standing,
  };
}

export type ClearanceType =
  | 'graduation' | 'withdrawal' | 'enrollment_letter' | 'id_replacement';
export type ClearanceStatus = 'pending' | 'cleared' | 'blocked';

export interface FinanceClearance {
  id: string;
  student_id: string;
  name_en: string;
  name_ar: string;
  type: ClearanceType;
  outstanding: number;
  submitted_at: string;
  status: ClearanceStatus;
  /** CCK rule: a Civil ID copy must be uploaded with every request. */
  cid_uploaded: boolean;
}

const FINANCE_CLEARANCES: FinanceClearance[] = [
  { id: 'FCL-2026-018', student_id: '20211045', name_en: 'Yousef Al-Mutairi', name_ar: 'يوسف المطيري',
    type: 'graduation', outstanding: 0, submitted_at: '2026-05-12T09:00:00Z', status: 'pending', cid_uploaded: true },
  { id: 'FCL-2026-019', student_id: '20230077', name_en: 'Dana Al-Otaibi', name_ar: 'دانة العتيبي',
    type: 'withdrawal', outstanding: 487.5, submitted_at: '2026-05-14T11:30:00Z', status: 'pending', cid_uploaded: true },
  { id: 'FCL-2026-020', student_id: '20240118', name_en: 'Noura Al-Shahri', name_ar: 'نورة الشهري',
    type: 'enrollment_letter', outstanding: 0, submitted_at: '2026-05-15T08:15:00Z', status: 'pending', cid_uploaded: false },
  { id: 'FCL-2026-021', student_id: '20250203', name_en: 'Faisal Al-Rashidi', name_ar: 'فيصل الرشيدي',
    type: 'id_replacement', outstanding: 5, submitted_at: '2026-05-16T13:45:00Z', status: 'pending', cid_uploaded: true },
  { id: 'FCL-2026-015', student_id: '20220612', name_en: 'Abdullah Al-Failakawi', name_ar: 'عبدالله الفيلكاوي',
    type: 'graduation', outstanding: 0, submitted_at: '2026-05-08T10:00:00Z', status: 'cleared', cid_uploaded: true },
  { id: 'FCL-2026-016', student_id: '20230455', name_en: 'Sara Al-Hajri', name_ar: 'سارة الهاجري',
    type: 'enrollment_letter', outstanding: 643.13, submitted_at: '2026-05-09T14:20:00Z', status: 'blocked', cid_uploaded: true },
];

const AI_MONITORING = {
  total_conversations: 12450,
  avg_satisfaction: 4.2,
  escalation_rate: 8.3,
  avg_response_time_sec: 2.1,
  conversations_today: 342,
  topic_distribution: [
    { topic: 'Registration & Enrollment', count: 3200, percentage: 25.7 },
    { topic: 'Grade Inquiries', count: 2680, percentage: 21.5 },
    { topic: 'Course Recommendations', count: 1870, percentage: 15.0 },
    { topic: 'Schedule Conflicts', count: 1560, percentage: 12.5 },
    { topic: 'Financial Aid & Payments', count: 1240, percentage: 10.0 },
    { topic: 'Campus Services', count: 980, percentage: 7.9 },
    { topic: 'Other', count: 920, percentage: 7.4 },
  ],
  escalation_reasons: [
    { reason: 'Low confidence (<70%)', count: 580, percentage: 56.1 },
    { reason: 'Student requested human', count: 245, percentage: 23.7 },
    { reason: 'Sensitive topic detected', count: 132, percentage: 12.8 },
    { reason: 'Multi-step process', count: 77, percentage: 7.4 },
  ],
  satisfaction_breakdown: [
    { rating: 5, count: 4200, percentage: 33.7 },
    { rating: 4, count: 4050, percentage: 32.5 },
    { rating: 3, count: 2490, percentage: 20.0 },
    { rating: 2, count: 1120, percentage: 9.0 },
    { rating: 1, count: 590, percentage: 4.7 },
  ],
  recent_escalations: [
    { id: 'esc_01', student: 'Khalid M.', topic: 'Financial hold on registration', timestamp: '2026-04-08T14:20:00Z', status: 'pending' },
    { id: 'esc_02', student: 'Noura A.', topic: 'Grade dispute CS301', timestamp: '2026-04-08T11:45:00Z', status: 'assigned' },
    { id: 'esc_03', student: 'Omar S.', topic: 'Graduation requirements unclear', timestamp: '2026-04-08T09:30:00Z', status: 'resolved' },
  ],
};

const CONTENT_ITEMS = {
  events: [
    { id: 'evt_1', title_en: 'Career Fair 2026', title_ar: 'معرض التوظيف ٢٠٢٦', date: '2026-04-20', status: 'approved', category: 'Career' },
    { id: 'evt_2', title_en: 'Hackathon: AI for Education', title_ar: 'هاكاثون: الذكاء الاصطناعي للتعليم', date: '2026-04-25', status: 'pending', category: 'Academic' },
    { id: 'evt_3', title_en: 'Spring Sports Tournament', title_ar: 'بطولة الربيع الرياضية', date: '2026-05-01', status: 'approved', category: 'Sports' },
  ],
  news: [
    { id: 'news_1', title_en: 'New Library Hours for Exam Period', title_ar: 'ساعات المكتبة الجديدة لفترة الاختبارات', date: '2026-04-08', status: 'published' },
    { id: 'news_2', title_en: 'Scholarship Applications Open', title_ar: 'فتح باب التقديم للمنح الدراسية', date: '2026-04-05', status: 'published' },
    { id: 'news_3', title_en: 'Campus Wi-Fi Upgrade', title_ar: 'تحديث شبكة الواي فاي', date: '2026-04-03', status: 'draft' },
  ],
  // The five official CCK student clubs (Student Life Department doc).
  clubs: [
    { id: 'club_1', name_en: 'Media Club', name_ar: 'النادي الإعلامي', members: 38, status: 'approved', advisor: 'Dalal Al-Fadhli' },
    { id: 'club_2', name_en: 'Community Club', name_ar: 'نادي المجتمع', members: 52, status: 'approved', advisor: 'Dalal Al-Fadhli' },
    { id: 'club_3', name_en: 'Student Workers Club', name_ar: 'نادي الطلبة العاملين', members: 24, status: 'approved', advisor: 'Mishaal Al-Adwani' },
    { id: 'club_4', name_en: 'Computer Science Club', name_ar: 'نادي علوم الحاسوب', members: 61, status: 'approved', advisor: 'Dr. Omar Al-Barno' },
    { id: 'club_5', name_en: 'Debate Club', name_ar: 'نادي المناظرات', members: 29, status: 'approved', advisor: 'Dr. Layla Al-Rashid' },
  ],
};

const INTEGRATIONS = [
  {
    adapter_id: 'blackboard',
    name_ar: 'بلاك بورد',
    name_en: 'Blackboard',
    status: 'connected',
    last_sync: '2026-04-08T06:00:00Z',
    records_synced: 12450,
    health: 'healthy',
  },
  {
    adapter_id: 'banner',
    name_ar: 'بانر',
    name_en: 'Banner',
    status: 'syncing',
    last_sync: '2026-04-08T07:30:00Z',
    records_synced: 8920,
    health: 'healthy',
    sync_progress: 67,
  },
  {
    adapter_id: 'canvas',
    name_ar: 'كانفاس',
    name_en: 'Canvas',
    status: 'disconnected',
    last_sync: '2026-04-01T12:00:00Z',
    records_synced: 0,
    health: 'error',
    error_ar: 'انتهت صلاحية مفتاح الاتصال',
    error_en: 'API key expired',
  },
];

const CAMPUS_DIRECTORY = [
  {
    id: 'dir_1', type: 'building' as const,
    name_en: 'Main Administration Building', name_ar: 'مبنى الإدارة الرئيسي',
    location_en: 'Central Campus', location_ar: 'الحرم المركزي',
    phone: '+966-11-467-0000', email: 'admin@ksu.edu.sa',
    hours_en: 'Sun-Thu 8:00-16:00', hours_ar: 'الأحد-الخميس ٨:٠٠-١٦:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_2', type: 'office' as const,
    name_en: 'Registrar Office', name_ar: 'مكتب القبول والتسجيل',
    location_en: 'Admin Building, Floor 2', location_ar: 'مبنى الإدارة، الطابق الثاني',
    phone: '+966-11-467-1111', email: 'registrar@ksu.edu.sa',
    hours_en: 'Sun-Thu 9:00-15:00', hours_ar: 'الأحد-الخميس ٩:٠٠-١٥:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_3', type: 'service' as const,
    name_en: 'Student Health Center', name_ar: 'مركز صحة الطلاب',
    location_en: 'Building 14', location_ar: 'مبنى ١٤',
    phone: '+966-11-467-2222', email: 'health@ksu.edu.sa',
    hours_en: 'Sun-Thu 8:00-20:00', hours_ar: 'الأحد-الخميس ٨:٠٠-٢٠:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_4', type: 'service' as const,
    name_en: 'IT Help Desk', name_ar: 'مكتب الدعم التقني',
    location_en: 'Library Building, Ground Floor', location_ar: 'مبنى المكتبة، الطابق الأرضي',
    phone: '+966-11-467-3333', email: 'it@ksu.edu.sa',
    hours_en: 'Sun-Thu 8:00-22:00', hours_ar: 'الأحد-الخميس ٨:٠٠-٢٢:٠٠',
    status: 'draft' as const,
  },
  {
    id: 'dir_5', type: 'building' as const,
    name_en: 'College of Computer Science', name_ar: 'كلية علوم الحاسب',
    location_en: 'North Campus', location_ar: 'الحرم الشمالي',
    phone: '+966-11-467-4444', email: 'cs@ksu.edu.sa',
    hours_en: 'Sun-Thu 7:30-21:00', hours_ar: 'الأحد-الخميس ٧:٣٠-٢١:٠٠',
    status: 'published' as const,
  },
];

const FEATURE_HEATMAP = {
  features: ['Schedule View', 'Grade Check', 'Payment Portal', 'AI Advisor', 'Campus Events', 'Social Feed', 'Library Search', 'Club Activities'],
  features_ar: ['عرض الجدول', 'التحقق من الدرجات', 'بوابة الدفع', 'المستشار الذكي', 'فعاليات الحرم', 'المنشورات', 'بحث المكتبة', 'أنشطة الأندية'],
  hours: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'],
  hours_ar: ['٨ص', '٩ص', '١٠ص', '١١ص', '١٢م', '١م', '٢م', '٣م', '٤م', '٥م', '٦م', '٧م', '٨م', '٩م', '١٠م'],
  data: [
    // Schedule View - peaks in morning
    [85, 92, 78, 45, 30, 35, 28, 22, 18, 15, 12, 10, 8, 6, 4],
    // Grade Check - peaks around midday
    [20, 35, 55, 72, 80, 88, 75, 60, 50, 42, 38, 30, 45, 55, 35],
    // Payment Portal - spikes around 10-1
    [10, 15, 45, 60, 55, 50, 35, 25, 20, 18, 15, 12, 10, 8, 5],
    // AI Advisor - steady afternoon/evening
    [8, 12, 18, 25, 30, 38, 42, 48, 52, 55, 58, 60, 65, 62, 45],
    // Campus Events - peaks late afternoon
    [5, 8, 12, 15, 18, 22, 28, 35, 45, 55, 60, 52, 40, 30, 18],
    // Social Feed - peaks evening
    [3, 5, 8, 12, 18, 25, 30, 35, 42, 50, 60, 72, 80, 75, 55],
    // Library Search - peaks mid-morning
    [15, 25, 40, 55, 48, 35, 28, 22, 18, 15, 12, 10, 15, 20, 12],
    // Club Activities - peaks late afternoon
    [2, 3, 5, 8, 10, 12, 18, 28, 38, 45, 42, 35, 25, 18, 10],
  ],
};

const FOLLOW_UP_REMINDERS = [
  { id: 'fu_1', student_id: 'student_401', student_name_en: 'Mohammed Al-Otaibi', student_name_ar: 'محمد العتيبي', intervention_date: '2026-03-10', due_date: '2026-04-09', status: 'overdue' as const, action: 'Schedule Meeting' },
  { id: 'fu_2', student_id: 'student_402', student_name_en: 'Sarah Al-Dosari', student_name_ar: 'سارة الدوسري', intervention_date: '2026-03-20', due_date: '2026-04-19', status: 'upcoming' as const, action: 'Contact Parent/Guardian' },
];

const SENT_MESSAGES = [
  { message_id: 'comm_001', subject_en: 'Registration Reminder', subject_ar: 'تذكير بالتسجيل', target_audience: 'all_students', recipients_count: 4200, sent_at: '2026-04-07T10:00:00Z', channels: ['push', 'email'] },
  { message_id: 'comm_002', subject_en: 'Payment Deadline', subject_ar: 'موعد السداد', target_audience: 'at_risk', recipients_count: 47, sent_at: '2026-04-05T14:00:00Z', channels: ['push', 'email', 'sms'] },
];

/* ────────────────────────────────────────────────────────────
 * CCK-Hub workflow mock data
 *   Backs the Document Management & Workflow System spec.
 *   Types are duplicated here on purpose - admin app is a
 *   standalone front-end with no backend wired up yet.
 * ──────────────────────────────────────────────────────────── */

export type AssignableStaff = {
  id: string;
  name_en: string;
  name_ar: string;
  dept_en: string;
  dept_ar: string;
};

const ASSIGNABLE_STAFF: AssignableStaff[] = [
  { id: 'staff_reg_1', name_en: 'Noura Al-Shahri', name_ar: 'نورة الشهري', dept_en: 'Registration', dept_ar: 'التسجيل' },
  { id: 'staff_reg_2', name_en: 'Hessa Al-Mutawa', name_ar: 'حصة المطوع', dept_en: 'Registration', dept_ar: 'التسجيل' },
  { id: 'staff_adm_1', name_en: 'Ahmed Al-Ghamdi', name_ar: 'أحمد الغامدي', dept_en: 'Admission', dept_ar: 'القبول' },
  { id: 'staff_fin_1', name_en: 'Mishaal Al-Adwani', name_ar: 'مشعل العدواني', dept_en: 'Finance', dept_ar: 'المالية' },
  { id: 'staff_it_1', name_en: 'IT Helpdesk', name_ar: 'مكتب الدعم التقني', dept_en: 'IT', dept_ar: 'الدعم التقني' },
  { id: 'staff_acad_1', name_en: 'Dr. Omar Al-Barno', name_ar: 'د. عمر البرنو', dept_en: 'Academic Staff', dept_ar: 'الهيئة الأكاديمية' },
  { id: 'staff_sl_1', name_en: 'Dalal Al-Fadhli', name_ar: 'دلال الفضلي', dept_en: 'Student Life', dept_ar: 'شؤون الطلبة' },
];

export type RequestType =
  | 'twimc'
  | 'twimc_balance'
  | 'transcript'
  | 'semester_withdrawal'
  | 'college_withdrawal'
  | 'absence_excuse'
  | 'expected_grad'
  | 'puc_letter'
  | 'puc_no_aid'
  | 'industrial_cert'
  | 'lost_id'
  | 'update_id_photo';

export type RequestStatus = 'submitted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface RequestComment {
  id: string;
  author_en: string;
  author_ar: string;
  body: string;
  created_at: string;
  internal: boolean;
}

export interface RequestAttachment {
  id: string;
  name: string;
  size_kb: number;
  uploaded_by_en: string;
  uploaded_by_ar: string;
  uploaded_at: string;
}

export interface RequestWorkflowStep {
  key: string;
  label_en: string;
  label_ar: string;
  status: 'completed' | 'current' | 'pending';
  completed_at?: string;
  sla_days?: number;
}

export type RequestStageStatus = 'on_track' | 'due_soon' | 'due_today' | 'overdue';

export interface RequestStageInfo {
  step: RequestWorkflowStep;
  department: 'registration' | 'finance' | 'advisor' | 'puc' | 'it' | null;
  startedAt: string;
  daysAtStage: number;
  slaDays: number;
  daysUntilDue: number;
  daysOverdue: number;
  status: RequestStageStatus;
}

const STEP_DEPARTMENT: Record<string, 'registration' | 'finance' | 'advisor' | 'puc' | 'it'> = {
  submitted: 'registration',
  paid: 'finance',
  in_progress: 'registration',
  review: 'registration',
  applied: 'registration',
  registration: 'registration',
  finance: 'finance',
  advisor: 'advisor',
  puc: 'puc',
  it: 'it',
};

const STEP_SLA_DAYS: Record<string, number> = {
  submitted: 0,
  paid: 1,
  in_progress: 3,
  review: 2,
  applied: 1,
  registration: 3,
  finance: 2,
  advisor: 5,
  puc: 7,
  it: 2,
  completed: 1,
};

const DAY_MS = 86_400_000;

function hydrateWorkflow(steps: RequestWorkflowStep[], submittedAt: string): RequestWorkflowStep[] {
  let cursorMs = new Date(submittedAt).getTime();
  return steps.map((step) => {
    const slaDays = step.sla_days ?? STEP_SLA_DAYS[step.key] ?? 2;
    if (step.status === 'completed') {
      const completedMs = step.completed_at
        ? new Date(step.completed_at).getTime()
        : cursorMs + slaDays * DAY_MS;
      cursorMs = completedMs;
      return { ...step, sla_days: slaDays, completed_at: new Date(completedMs).toISOString() };
    }
    return { ...step, sla_days: slaDays };
  });
}

export function getRequestStageInfo(req: StudentRequest, now: Date = new Date()): RequestStageInfo | null {
  if (req.status === 'completed' || req.status === 'cancelled' || req.status === 'rejected') return null;
  const idx = req.workflow.findIndex((s) => s.status === 'current');
  if (idx < 0) return null;
  const step = req.workflow[idx];
  const previous = [...req.workflow.slice(0, idx)].reverse().find((s) => s.completed_at);
  const startedAt = previous?.completed_at ?? req.submitted_at;
  const daysAtStage = Math.max(
    0,
    Math.floor((now.getTime() - new Date(startedAt).getTime()) / DAY_MS),
  );
  const slaDays = step.sla_days ?? STEP_SLA_DAYS[step.key] ?? 3;
  const daysUntilDue = slaDays - daysAtStage;
  const daysOverdue = daysUntilDue < 0 ? -daysUntilDue : 0;
  let status: RequestStageStatus;
  if (daysUntilDue < 0) status = 'overdue';
  else if (daysUntilDue === 0) status = 'due_today';
  else if (daysUntilDue <= 1) status = 'due_soon';
  else status = 'on_track';
  return {
    step,
    department: STEP_DEPARTMENT[step.key] ?? null,
    startedAt,
    daysAtStage,
    slaDays,
    daysUntilDue,
    daysOverdue,
    status,
  };
}

export interface StudentRequest {
  id: string;
  type: RequestType;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  status: RequestStatus;
  submitted_at: string;
  assigned_to_en: string | null;
  assigned_to_ar: string | null;
  payment_status: 'paid' | 'pending' | 'not_required';
  workflow: RequestWorkflowStep[];
  attachments: RequestAttachment[];
  comments: RequestComment[];
  /** Study week the withdrawal was filed in — drives the financial fine
   *  (CCK Registration & fees policy). Only set on withdrawal requests. */
  withdrawal_study_week?: number;
  /** Term tuition the withdrawal fine percentage is applied to (KWD). */
  withdrawal_tuition_kwd?: number;
  /** Reason captured when a request is rejected — sent to the student by
   *  email (CCK Hub Update.pdf: rejection must email the reason). */
  rejection_reason?: string;
}

const wfTwimc = (step: 0 | 1 | 2 | 3, submittedAt: string): RequestWorkflowStep[] => hydrateWorkflow([
  { key: 'submitted', label_en: 'Submitted by student', label_ar: 'قدّمها الطالب',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'paid', label_en: 'Online payment received', label_ar: 'تم استلام الدفع',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'in_progress', label_en: 'Assigned to Registration', label_ar: 'مسند للتسجيل',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
  { key: 'completed', label_en: 'Letter ready for pickup', label_ar: 'الخطاب جاهز للاستلام',
    status: step >= 3 ? 'completed' : step === 2 ? 'current' : 'pending' },
], submittedAt);

const wfWithdrawal = (step: 0 | 1 | 2 | 3 | 4, submittedAt: string): RequestWorkflowStep[] => hydrateWorkflow([
  { key: 'submitted', label_en: 'Form submitted by student', label_ar: 'قدّم الطالب النموذج',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'advisor', label_en: 'Advisor feedback', label_ar: 'رأي المرشد',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'finance', label_en: 'Finance approval', label_ar: 'موافقة المالية',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
  { key: 'puc', label_en: 'PUC documents (if sponsored)', label_ar: 'مستندات PUC (للمبتعثين)',
    status: step >= 3 ? 'completed' : step === 2 ? 'current' : 'pending' },
  { key: 'registration', label_en: 'Registration processing', label_ar: 'إجراء التسجيل',
    status: step >= 4 ? 'completed' : step === 3 ? 'current' : 'pending' },
], submittedAt);

const wfAbsence = (step: 0 | 1 | 2, submittedAt: string): RequestWorkflowStep[] => hydrateWorkflow([
  { key: 'submitted', label_en: 'Excuse + medical doc submitted', label_ar: 'تقديم العذر والمستند الطبي',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'review', label_en: 'Registration review', label_ar: 'مراجعة التسجيل',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'applied', label_en: 'Excuse applied to courses in SIS', label_ar: 'تطبيق العذر في النظام الأكاديمي',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
], submittedAt);

// PUC tuition-aid letters carry no payment — the flow is select letter →
// upload Civil ID → Registration drafts → received from PUC (CCK Hub Update.pdf).
const wfPucLetter = (step: 0 | 1 | 2 | 3, submittedAt: string): RequestWorkflowStep[] => hydrateWorkflow([
  { key: 'submitted', label_en: 'PUC letter requested + Civil ID uploaded', label_ar: 'طلب خطاب PUC ورفع البطاقة المدنية',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'in_progress', label_en: 'Assigned to Registration', label_ar: 'مسند للتسجيل',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'puc', label_en: 'Sent to PUC', label_ar: 'أُرسل إلى PUC',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
  { key: 'completed', label_en: 'Letter received from PUC', label_ar: 'استلام الخطاب من PUC',
    status: step >= 3 ? 'completed' : step === 2 ? 'current' : 'pending' },
], submittedAt);

// Update Student ID photo — IT applies white background, then re-issues card.
const wfIdPhoto = (step: 0 | 1 | 2, submittedAt: string): RequestWorkflowStep[] => hydrateWorkflow([
  { key: 'submitted', label_en: 'New photo submitted', label_ar: 'تقديم الصورة الجديدة',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'it', label_en: 'IT reviews photo (white background applied)', label_ar: 'مراجعة IT للصورة (تطبيق خلفية بيضاء)',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'registration', label_en: 'Updated ID ready for pickup', label_ar: 'البطاقة المحدّثة جاهزة للاستلام',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
], submittedAt);

const STUDENT_REQUESTS: StudentRequest[] = [
  {
    id: 'REQ-2026-0431', type: 'twimc',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    status: 'in_progress', submitted_at: '2026-04-23T08:14:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري',
    payment_status: 'paid',
    workflow: wfTwimc(2, '2026-04-23T08:14:00Z'),
    attachments: [
      { id: 'att1', name: 'civil_id.pdf', size_kb: 412, uploaded_by_en: 'Yousef Al-Mutairi', uploaded_by_ar: 'يوسف المطيري', uploaded_at: '2026-04-23T08:14:00Z' },
    ],
    comments: [
      { id: 'c1', author_en: 'Noura Al-Shahri', author_ar: 'نورة الشهري',
        body: 'Letter drafted, pending department head signature.', created_at: '2026-04-24T10:21:00Z', internal: true },
    ],
  },
  {
    id: 'REQ-2026-0432', type: 'transcript',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    status: 'submitted', submitted_at: '2026-04-25T11:02:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'paid',
    workflow: wfTwimc(1, '2026-04-25T11:02:00Z'),
    attachments: [],
    comments: [],
  },
  {
    id: 'REQ-2026-0433', type: 'semester_withdrawal',
    student_id: '20201990', student_name_en: 'Khalid Al-Rashidi', student_name_ar: 'خالد الرشيدي',
    status: 'in_progress', submitted_at: '2026-04-19T13:40:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    withdrawal_study_week: 3,
    withdrawal_tuition_kwd: 1500,
    workflow: wfWithdrawal(2, '2026-04-19T13:40:00Z'),
    attachments: [
      { id: 'att2', name: 'withdrawal_form_signed.pdf', size_kb: 880, uploaded_by_en: 'Khalid Al-Rashidi', uploaded_by_ar: 'خالد الرشيدي', uploaded_at: '2026-04-19T13:40:00Z' },
      { id: 'att3', name: 'PUC_freeze_form.pdf', size_kb: 624, uploaded_by_en: 'Khalid Al-Rashidi', uploaded_by_ar: 'خالد الرشيدي', uploaded_at: '2026-04-20T09:11:00Z' },
    ],
    comments: [
      { id: 'c2', author_en: 'Ahmed Al-Ghamdi (Advisor)', author_ar: 'أحمد الغامدي (مرشد)',
        body: 'Student has cleared all incomplete grades. Recommended approval.', created_at: '2026-04-21T08:55:00Z', internal: false },
    ],
  },
  {
    id: 'REQ-2026-0434', type: 'absence_excuse',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    status: 'submitted', submitted_at: '2026-04-26T07:20:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'not_required',
    workflow: wfAbsence(1, '2026-04-26T07:20:00Z'),
    attachments: [
      { id: 'att4', name: 'medical_report.pdf', size_kb: 521, uploaded_by_en: 'Lina Al-Otaibi', uploaded_by_ar: 'لينا العتيبي', uploaded_at: '2026-04-26T07:20:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0435', type: 'puc_letter',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    status: 'completed', submitted_at: '2026-04-10T09:00:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfPucLetter(3, '2026-04-10T09:00:00Z'),
    attachments: [
      { id: 'att5', name: 'civil_id.pdf', size_kb: 412, uploaded_by_en: 'Yousef Al-Mutairi', uploaded_by_ar: 'يوسف المطيري', uploaded_at: '2026-04-10T09:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0436', type: 'college_withdrawal',
    student_id: '20191130', student_name_en: 'Fatima Al-Sabah', student_name_ar: 'فاطمة الصباح',
    status: 'in_progress', submitted_at: '2026-04-15T14:00:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    withdrawal_study_week: 4,
    withdrawal_tuition_kwd: 2625,
    workflow: wfWithdrawal(3, '2026-04-15T14:00:00Z'),
    attachments: [
      { id: 'att6', name: 'college_withdrawal_form.pdf', size_kb: 901, uploaded_by_en: 'Fatima Al-Sabah', uploaded_by_ar: 'فاطمة الصباح', uploaded_at: '2026-04-15T14:00:00Z' },
      { id: 'att7', name: 'PUC_scholarship_cancel.pdf', size_kb: 612, uploaded_by_en: 'Fatima Al-Sabah', uploaded_by_ar: 'فاطمة الصباح', uploaded_at: '2026-04-16T11:20:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0437', type: 'expected_grad',
    student_id: '20191205', student_name_en: 'Abdullah Al-Failakawi', student_name_ar: 'عبدالله الفيلكاوي',
    status: 'submitted', submitted_at: '2026-04-26T09:30:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'paid',
    workflow: wfTwimc(1, '2026-04-26T09:30:00Z'),
    attachments: [],
    comments: [],
  },
  {
    id: 'REQ-2026-0438', type: 'industrial_cert',
    student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    status: 'in_progress', submitted_at: '2026-04-22T10:15:00Z',
    assigned_to_en: 'Ahmed Al-Ghamdi', assigned_to_ar: 'أحمد الغامدي', payment_status: 'not_required',
    workflow: wfTwimc(2, '2026-04-22T10:15:00Z'),
    attachments: [
      { id: 'att8', name: 'industrial_certificate.pdf', size_kb: 1180, uploaded_by_en: 'Ahmed Al-Ghamdi', uploaded_by_ar: 'أحمد الغامدي', uploaded_at: '2026-04-22T10:15:00Z' },
    ],
    comments: [
      { id: 'c3', author_en: 'Ahmed Al-Ghamdi', author_ar: 'أحمد الغامدي',
        body: 'Forwarded to Registration to draft PUC acceptance letter.', created_at: '2026-04-23T13:00:00Z', internal: true },
    ],
  },
  {
    id: 'REQ-2026-0439', type: 'lost_id',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    status: 'in_progress', submitted_at: '2026-04-24T15:30:00Z',
    assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني', payment_status: 'paid',
    workflow: hydrateWorkflow([
      { key: 'submitted', label_en: 'Lost ID request submitted', label_ar: 'تقديم طلب فقدان البطاقة', status: 'completed' },
      { key: 'finance', label_en: 'Finance - replacement fee', label_ar: 'المالية - رسوم البدل', status: 'completed' },
      { key: 'it', label_en: 'IT prints new card', label_ar: 'IT يطبع البطاقة الجديدة', status: 'current' },
      { key: 'registration', label_en: 'Pickup at Registration', label_ar: 'الاستلام من التسجيل', status: 'pending' },
    ], '2026-04-24T15:30:00Z'),
    attachments: [],
    comments: [],
  },
  {
    id: 'REQ-2026-0440', type: 'update_id_photo',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    status: 'in_progress', submitted_at: '2026-04-25T10:05:00Z',
    assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني', payment_status: 'not_required',
    workflow: wfIdPhoto(1, '2026-04-25T10:05:00Z'),
    attachments: [
      { id: 'att9', name: 'new_photo.jpg', size_kb: 318, uploaded_by_en: 'Lina Al-Otaibi', uploaded_by_ar: 'لينا العتيبي', uploaded_at: '2026-04-25T10:05:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0441', type: 'puc_no_aid',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    status: 'in_progress', submitted_at: '2026-04-24T09:40:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfPucLetter(1, '2026-04-24T09:40:00Z'),
    attachments: [
      { id: 'att10', name: 'civil_id.pdf', size_kb: 405, uploaded_by_en: 'Mariam Al-Ajmi', uploaded_by_ar: 'مريم العجمي', uploaded_at: '2026-04-24T09:40:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0442', type: 'absence_excuse',
    student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    status: 'rejected', submitted_at: '2026-04-12T08:30:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfAbsence(1, '2026-04-12T08:30:00Z'),
    rejection_reason: 'Medical report submitted 6 days after the absence — outside the 5-day window required by the CCK Attendance Policy.',
    attachments: [
      { id: 'att11', name: 'medical_note.pdf', size_kb: 288, uploaded_by_en: 'Saad Al-Hajri', uploaded_by_ar: 'سعد الهاجري', uploaded_at: '2026-04-12T08:30:00Z' },
    ],
    comments: [],
  },
];

export interface AdmissionApplicant {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  category: 'self_funded' | 'puc_sponsored' | 'other' | 'tc';
  transferred_from?: string;
  major: string;
  semester_admitted: string;
  entry_level: string;
  stage: 'admission' | 'academic' | 'admission_approval' | 'registration' | 'completed';
  documents: { key: string; status: 'uploaded' | 'missing' | 'flagged' }[];
  submitted_at: string;
  acceptance_letter_generated: boolean;
  /** SIS Student ID issued by Registration at the final enrolment step
   *  (Admission-Registration Workflow doc). */
  sis_student_id?: string;
}

/** Institutions a Transfer-Credit (TC) applicant can transfer from — an
 *  enumerated dropdown source per the Admission-Registration Workflow doc. */
export const TRANSFER_INSTITUTIONS: { value: string; label_en: string; label_ar: string }[] = [
  { value: 'paaet', label_en: 'PAAET — Public Authority for Applied Education & Training', label_ar: 'الهيئة العامة للتعليم التطبيقي والتدريب' },
  { value: 'ku', label_en: 'Kuwait University', label_ar: 'جامعة الكويت' },
  { value: 'gust', label_en: 'Gulf University for Science & Technology', label_ar: 'جامعة الخليج للعلوم والتكنولوجيا' },
  { value: 'auk', label_en: 'American University of Kuwait', label_ar: 'الجامعة الأمريكية في الكويت' },
  { value: 'aum', label_en: 'American University of the Middle East', label_ar: 'الجامعة الأمريكية في الشرق الأوسط' },
  { value: 'box_hill', label_en: 'Box Hill College Kuwait', label_ar: 'كلية بوكس هل الكويت' },
  { value: 'other', label_en: 'Other institution', label_ar: 'مؤسسة أخرى' },
];

const ADMISSION_DOC_KEYS = [
  'civil_id', 'passport', 'equivalency', 'high_school',
  'father_civil_id', 'declaration', 'payment_proof',
  'puc_declaration', 'placement_test',
];

const ADMISSION_APPLICANTS: AdmissionApplicant[] = [
  {
    id: 'ADM-2026-101',
    applicant_name_en: 'Hessa Al-Mansour', applicant_name_ar: 'حصة المنصور',
    category: 'self_funded',
    major: 'Diploma of Business - Accounting', semester_admitted: 'Fall 2026', entry_level: 'Level 3',
    stage: 'admission_approval',
    documents: ADMISSION_DOC_KEYS.map((k) => ({
      key: k,
      status: k === 'puc_declaration' ? 'missing' : k === 'placement_test' ? 'flagged' : 'uploaded',
    })),
    submitted_at: '2026-04-15T09:00:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-102',
    applicant_name_en: 'Faisal Al-Sane', applicant_name_ar: 'فيصل السانع',
    category: 'puc_sponsored',
    major: 'Diploma of Computer Programming', semester_admitted: 'Fall 2026', entry_level: 'Level 2',
    stage: 'admission',
    documents: ADMISSION_DOC_KEYS.map((k) => ({
      key: k,
      status: k === 'payment_proof' ? 'missing' : 'uploaded',
    })),
    submitted_at: '2026-04-22T11:30:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-103',
    applicant_name_en: 'Dana Al-Khalifa', applicant_name_ar: 'دانة الخليفة',
    category: 'tc', transferred_from: 'PAAET - Computer Engineering Technology',
    major: 'Diploma of Computer Programming', semester_admitted: 'Fall 2026', entry_level: 'Level 4',
    stage: 'academic',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-04-08T14:00:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-104',
    applicant_name_en: 'Talal Al-Kandari', applicant_name_ar: 'طلال الكندري',
    category: 'self_funded',
    major: 'Diploma of Business - Management & Entrepreneurship', semester_admitted: 'Fall 2026', entry_level: 'Level 1',
    stage: 'completed',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-03-28T10:00:00Z',
    acceptance_letter_generated: true,
    sis_student_id: '20260104',
  },
  {
    id: 'ADM-2026-105',
    applicant_name_en: 'Aisha Al-Anezi', applicant_name_ar: 'عائشة العنزي',
    category: 'puc_sponsored',
    major: 'Diploma of Internet Applications & Web Development', semester_admitted: 'Fall 2026', entry_level: 'Level 3',
    stage: 'registration',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-04-02T08:30:00Z',
    acceptance_letter_generated: true,
  },
];

export type SocialCategory = 'kuwaiti' | 'kuwaiti_mother' | 'disabled' | 'married' | 'bank_change';
export interface SocialApplication {
  id: string;
  application_no: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  category: SocialCategory;
  status: 'pending' | 'in_progress' | 'rejected' | 'completed';
  submitted_at: string;
  documents: { key: string; quality: 'ok' | 'issue' }[];
  sent_to_puc: boolean;
}

const SOCIAL_DOCS: Record<SocialCategory, string[]> = {
  kuwaiti: ['civil_id', 'security', 'social_affairs', 'salary_transfer'],
  kuwaiti_mother: [
    'civil_id', 'manpower', 'social_affairs', 'mother_nationality',
    'mother_civil_id', 'birth_cert', 'salary_transfer', 'twimc_mother',
  ],
  disabled: ['disability_proof'],
  married: ['marriage_cert', 'marriage_continuity', 'wife_civil_id'],
  bank_change: ['civil_id', 'salary_transfer', 'bank_form'],
};

const SOCIAL_APPLICATIONS: SocialApplication[] = [
  {
    id: 'SOC-2026-001', application_no: 'SA-26-001',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    category: 'kuwaiti', status: 'in_progress',
    submitted_at: '2026-04-18T10:00:00Z',
    documents: SOCIAL_DOCS.kuwaiti.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-002', application_no: 'SA-26-002',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    category: 'kuwaiti_mother', status: 'pending',
    submitted_at: '2026-04-22T14:30:00Z',
    documents: SOCIAL_DOCS.kuwaiti_mother.map((k, i) => ({
      key: k, quality: i === 3 ? 'issue' : 'ok',
    })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-003', application_no: 'SA-26-003',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    category: 'married', status: 'completed',
    submitted_at: '2026-04-05T09:15:00Z',
    documents: SOCIAL_DOCS.married.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: true,
  },
  {
    id: 'SOC-2026-004', application_no: 'SA-26-004',
    student_id: '20241002', student_name_en: 'Reem Al-Failakawi', student_name_ar: 'ريم الفيلكاوي',
    category: 'disabled', status: 'in_progress',
    submitted_at: '2026-04-20T11:00:00Z',
    documents: SOCIAL_DOCS.disabled.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-005', application_no: 'SA-26-005',
    student_id: '20191130', student_name_en: 'Fatima Al-Sabah', student_name_ar: 'فاطمة الصباح',
    category: 'bank_change', status: 'pending',
    submitted_at: '2026-04-25T08:00:00Z',
    documents: SOCIAL_DOCS.bank_change.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
];

export interface Appeal {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  course_code: string;
  course_name: string;
  current_grade: string;
  status: 'submitted' | 'in_progress' | 'completed';
  submitted_at: string;
  faculty_assigned_en: string;
  faculty_assigned_ar: string;
  form_uploaded: boolean;
}

const APPEALS: Appeal[] = [
  {
    id: 'APP-2026-001', student_id: '20211045',
    student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    course_code: 'BUS 301', course_name: 'Operations Management',
    current_grade: 'D+', status: 'submitted', submitted_at: '2026-04-25T11:00:00Z',
    faculty_assigned_en: 'Dr. Hassan Al-Sayed', faculty_assigned_ar: 'د. حسن السيد',
    form_uploaded: true,
  },
  {
    id: 'APP-2026-002', student_id: '20221180',
    student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    course_code: 'ENG 201', course_name: 'Engineering Mechanics',
    current_grade: 'C-', status: 'in_progress', submitted_at: '2026-04-24T13:00:00Z',
    faculty_assigned_en: 'Dr. Layla Al-Rashid', faculty_assigned_ar: 'د. ليلى الرشيد',
    form_uploaded: true,
  },
];

export interface FaRoster {
  course_code: string;
  course_name: string;
  section: string;
  /** Credit hours — drives the per-credit attendance thresholds
   *  (CCK Attendance Policy). */
  credit_hours: number;
  instructor_en: string;
  instructor_ar: string;
  instructor_email: string;
  students: {
    id: string;
    student_id: string;
    name_en: string;
    name_ar: string;
    attendance_pct: number;
    /** Cumulative absent contact-hours — compared against the policy thresholds. */
    absences: number;
    assessments: { label: string; score: number }[];
    total_grade: number;
    decision: 'pending' | 'fa_admitted' | 'absence_removed';
    warning_email_sent?: boolean;
  }[];
}

// Courses, names, and instructors are real CCK catalog / faculty data. The two
// rosters owned by admission@cck.edu.kw keep that email so the demo login's
// "My courses" scope still works.
const FA_ROSTERS: FaRoster[] = [
  {
    course_code: 'MKT2205', course_name: 'Marketing Foundations',
    section: 'Section A', credit_hours: 3, instructor_en: 'Ahmed Al-Ghamdi', instructor_ar: 'أحمد الغامدي',
    instructor_email: 'admission@cck.edu.kw',
    students: [
      {
        id: 'fa1', student_id: '20231022', name_en: 'Lina Al-Otaibi', name_ar: 'لينا العتيبي',
        attendance_pct: 62, absences: 11,
        assessments: [{ label: 'Quiz 1', score: 7 }, { label: 'Midterm', score: 18 }, { label: 'Project', score: 12 }],
        total_grade: 37, decision: 'pending',
      },
      {
        id: 'fa2', student_id: '20211045', name_en: 'Yousef Al-Mutairi', name_ar: 'يوسف المطيري',
        attendance_pct: 70, absences: 9,
        assessments: [{ label: 'Quiz 1', score: 8 }, { label: 'Midterm', score: 22 }, { label: 'Project', score: 14 }],
        total_grade: 44, decision: 'pending',
      },
    ],
  },
  {
    course_code: 'BUMG3105', course_name: 'Operations Management',
    section: 'Section B', credit_hours: 3, instructor_en: 'Ahmed Al-Ghamdi', instructor_ar: 'أحمد الغامدي',
    instructor_email: 'admission@cck.edu.kw',
    students: [
      {
        id: 'fa4', student_id: '20221180', name_en: 'Mariam Al-Ajmi', name_ar: 'مريم العجمي',
        attendance_pct: 64, absences: 10,
        assessments: [{ label: 'Quiz 1', score: 6 }, { label: 'Midterm', score: 20 }],
        total_grade: 26, decision: 'pending',
      },
    ],
  },
  {
    course_code: 'ENL1813', course_name: 'Communications I',
    section: 'Section B', credit_hours: 3, instructor_en: 'Omar Samir El Borno', instructor_ar: 'عمر سمير البرنو',
    instructor_email: 'omar.elborno@cck.edu.kw',
    students: [
      {
        id: 'fa3', student_id: '20251002', name_en: 'Saad Al-Hajri', name_ar: 'سعد الهاجري',
        attendance_pct: 58, absences: 12,
        assessments: [{ label: 'Essay 1', score: 14 }, { label: 'Midterm', score: 19 }],
        total_grade: 33, decision: 'pending',
      },
    ],
  },
];

export interface AcademicWarning {
  id: string;
  student_id: string;
  name_en: string;
  name_ar: string;
  gpa: number;
  warning_semester: string;
  notified_at: string;
  signed_at: string | null;
}

const WARNINGS: AcademicWarning[] = [
  { id: 'w1', student_id: '20231022', name_en: 'Lina Al-Otaibi', name_ar: 'لينا العتيبي',
    gpa: 1.7, warning_semester: 'Spring 2026', notified_at: '2026-04-20T08:00:00Z', signed_at: null },
  { id: 'w2', student_id: '20221180', name_en: 'Mariam Al-Ajmi', name_ar: 'مريم العجمي',
    gpa: 1.85, warning_semester: 'Spring 2026', notified_at: '2026-04-18T08:00:00Z', signed_at: '2026-04-22T11:00:00Z' },
  { id: 'w3', student_id: '20251002', name_en: 'Saad Al-Hajri', name_ar: 'سعد الهاجري',
    gpa: 1.6, warning_semester: 'Spring 2026', notified_at: '2026-04-21T08:00:00Z', signed_at: null },
];

export type CommitteeStage = 'not_sent' | 'with_committee' | 'decided';

export interface FeedbackEntry {
  id: string;
  type: 'complaint' | 'suggestion';
  subject: string;
  body: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  department: string;
  status: 'open' | 'in_progress' | 'resolved';
  submitted_at: string;
  /** Optional supporting attachment (image / video / PDF) — Student Life doc. */
  attachment?: string;
  /** Complaints route through a committee: Student Life → committee feedback
   *  form → decision back to Student Life (Student Life Department doc). */
  committee_stage?: CommitteeStage;
  committee_decision?: string;
}

const FEEDBACK_ENTRIES: FeedbackEntry[] = [
  { id: 'fb1', type: 'complaint', subject: 'Wifi outage in Building 4',
    body: 'Wifi has been unreliable in Block 4 study area for the past week.',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    department: 'IT', status: 'in_progress', submitted_at: '2026-04-22T10:00:00Z',
    attachment: 'wifi_signal_screenshot.png', committee_stage: 'with_committee' },
  { id: 'fb2', type: 'complaint', subject: 'Cafeteria pricing',
    body: 'Cafeteria meal prices have increased without notice.',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    department: 'Student Life', status: 'open', submitted_at: '2026-04-25T09:30:00Z',
    committee_stage: 'not_sent' },
  { id: 'fb3', type: 'suggestion', subject: 'Add evening library hours during finals',
    body: 'Could the library stay open until midnight during finals week?',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    department: 'Library', status: 'open', submitted_at: '2026-04-24T20:00:00Z' },
  { id: 'fb4', type: 'suggestion', subject: 'Mobile app - Arabic course names',
    body: 'Some course names in the app are still only in English.',
    student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    department: 'IT', status: 'resolved', submitted_at: '2026-04-12T14:00:00Z' },
];

export interface SportApplication {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  /** Local Clubs Player (official club letter + Civil ID) vs Amateur Player
   *  (recognised on college coach selection + Civil ID). Student Life doc. */
  player_type: 'local_club' | 'amateur';
  activity: string;
  proof_doc: string;
  /** Selecting coach — only set for amateur-player applications. */
  coach_en?: string;
  coach_ar?: string;
  discount_pct: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

const SPORT_APPLICATIONS: SportApplication[] = [
  { id: 'sp1', student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    player_type: 'local_club',
    activity: 'Kuwait National Football Team - Youth', proof_doc: 'club_letter + civil_id.pdf',
    discount_pct: 25, status: 'pending', submitted_at: '2026-04-22T11:00:00Z' },
  { id: 'sp2', student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    player_type: 'local_club',
    activity: 'Kazma SC - Women\'s Volleyball', proof_doc: 'club_letter + civil_id.pdf',
    discount_pct: 15, status: 'approved', submitted_at: '2026-04-10T08:00:00Z' },
  { id: 'sp3', student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    player_type: 'amateur',
    activity: 'College Basketball Team', proof_doc: 'civil_id.pdf',
    coach_en: 'Coach Bader Al-Azmi', coach_ar: 'المدرب بدر العازمي',
    discount_pct: 10, status: 'pending', submitted_at: '2026-04-24T09:00:00Z' },
];

/* ─── Student Life — events & club joining ─── */

export interface StudentLifeEvent {
  id: string;
  title_en: string;
  title_ar: string;
  date: string;
  time?: string;
  location_en?: string;
  location_ar?: string;
  description_en?: string;
  description_ar?: string;
  /** Internal CCK activity vs an external/community event. */
  scope: 'internal' | 'external';
  /** Audience the event is announced to. */
  audience: 'all' | 'freshmen' | 'graduating' | 'specific';
  audience_detail_en?: string;
  audience_detail_ar?: string;
  /** Estimated number of students the audience reaches. */
  audience_size: number;
  /** Whether students can register for the event (toggled by Student Life). */
  registration_open: boolean;
  registrations: number;
}

const STUDENT_LIFE_EVENTS: StudentLifeEvent[] = [
  { id: 'evt1', title_en: 'Career Fair 2026', title_ar: 'معرض التوظيف ٢٠٢٦',
    date: '2026-05-28', time: '09:30 - 14:00',
    location_en: 'Main Hall', location_ar: 'القاعة الرئيسية',
    description_en: 'Annual career fair connecting students with employers across Kuwait.',
    description_ar: 'معرض التوظيف السنوي الذي يربط الطلبة بأصحاب العمل في الكويت.',
    scope: 'internal', audience: 'all', audience_size: 4200,
    registration_open: true, registrations: 142 },
  { id: 'evt2', title_en: 'Hackathon: AI for Education', title_ar: 'هاكاثون: الذكاء الاصطناعي للتعليم',
    date: '2026-06-02', time: '10:00 - 18:00',
    location_en: 'Computer Lab CP-1', location_ar: 'مختبر الحاسوب CP-1',
    description_en: 'A one-day hackathon building AI-powered learning tools.',
    description_ar: 'هاكاثون ليوم واحد لبناء أدوات تعليمية مدعومة بالذكاء الاصطناعي.',
    scope: 'internal', audience: 'specific',
    audience_detail_en: 'Computer Science Club', audience_detail_ar: 'نادي علوم الحاسوب',
    audience_size: 120,
    registration_open: true, registrations: 38 },
  { id: 'evt3', title_en: 'Inter-College Sports Tournament', title_ar: 'بطولة الكليات الرياضية',
    date: '2026-06-10', time: '08:00 - 16:00',
    location_en: 'Sports Complex', location_ar: 'المجمع الرياضي',
    description_en: 'Inter-college tournament hosted with partner institutions.',
    description_ar: 'بطولة بين الكليات تُقام بالتعاون مع المؤسسات الشريكة.',
    scope: 'external', audience: 'all', audience_size: 4200,
    registration_open: false, registrations: 0 },
  { id: 'evt4', title_en: 'Graduating Class Ceremony', title_ar: 'حفل الدفعة المتخرجة',
    date: '2026-06-20', time: '17:00 - 20:00',
    location_en: 'Grand Auditorium', location_ar: 'المسرح الكبير',
    description_en: 'Commencement ceremony for the graduating class of 2026.',
    description_ar: 'حفل تخريج دفعة عام ٢٠٢٦.',
    scope: 'internal', audience: 'graduating', audience_size: 620,
    registration_open: true, registrations: 76 },
];

export interface EventRegistrant {
  student_id: string;
  name_en: string;
  name_ar: string;
  major_en: string;
  major_ar: string;
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  registered_at: string;
}

export interface EventNotification {
  id: string;
  title: string;
  body: string;
  target: 'registered' | 'audience';
  recipients: number;
  sent_at: string;
}

export interface StudentLifeEventDetail extends StudentLifeEvent {
  registrants: EventRegistrant[];
  notifications: EventNotification[];
}

const REG_FIRST: [string, string][] = [
  ['Mariam', 'مريم'], ['Yousef', 'يوسف'], ['Lina', 'لينا'], ['Saad', 'سعد'],
  ['Noura', 'نورة'], ['Ahmad', 'أحمد'], ['Dana', 'دانة'], ['Fahad', 'فهد'],
  ['Sara', 'سارة'], ['Omar', 'عمر'], ['Hessa', 'حصة'], ['Khaled', 'خالد'],
];
const REG_LAST: [string, string][] = [
  ['Al-Ajmi', 'العجمي'], ['Al-Mutairi', 'المطيري'], ['Al-Otaibi', 'العتيبي'],
  ['Al-Hajri', 'الهاجري'], ['Al-Rashidi', 'الرشيدي'], ['Al-Azmi', 'العازمي'],
  ['Al-Dosari', 'الدوسري'], ['Al-Salem', 'السالم'], ['Al-Sabah', 'الصباح'],
  ['Al-Fadhli', 'الفضلي'], ['Al-Enezi', 'العنزي'], ['Al-Shammari', 'الشمري'],
];
const REG_MAJORS: [string, string][] = [
  ['Computer Science', 'علوم الحاسوب'],
  ['Business Administration', 'إدارة الأعمال'],
  ['Interactive Media Design', 'تصميم الوسائط التفاعلية'],
  ['Accounting', 'المحاسبة'],
  ['Marketing', 'التسويق'],
  ['Engineering Technology', 'تقنية الهندسة'],
];
const REG_YEARS: EventRegistrant['year'][] = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

function genRegistrants(count: number, eventDate: string): EventRegistrant[] {
  const out: EventRegistrant[] = [];
  const eventTime = new Date(eventDate).getTime();
  for (let i = 0; i < count; i++) {
    const f = REG_FIRST[i % REG_FIRST.length];
    const l = REG_LAST[(i * 7 + 3) % REG_LAST.length];
    const m = REG_MAJORS[(i * 5) % REG_MAJORS.length];
    const daysBefore = 30 - (i % 28);
    out.push({
      student_id: `2024${String(1000 + i).padStart(4, '0')}`,
      name_en: `${f[0]} ${l[0]}`,
      name_ar: `${f[1]} ${l[1]}`,
      major_en: m[0],
      major_ar: m[1],
      year: REG_YEARS[(i * 3) % REG_YEARS.length],
      registered_at: new Date(eventTime - daysBefore * 86400000).toISOString(),
    });
  }
  return out;
}

const EVENT_REGISTRANTS: Record<string, EventRegistrant[]> = {};
const EVENT_NOTIFICATIONS: Record<string, EventNotification[]> = {
  evt1: [
    { id: 'ntf1', title: 'Career Fair venue confirmed',
      body: 'The Career Fair will be held at the Main Hall. Doors open at 09:30.',
      target: 'registered', recipients: 142, sent_at: '2026-05-10T09:00:00Z' },
  ],
};

function registrantsFor(ev: StudentLifeEvent): EventRegistrant[] {
  if (!EVENT_REGISTRANTS[ev.id]) {
    EVENT_REGISTRANTS[ev.id] = genRegistrants(ev.registrations, ev.date);
  }
  return EVENT_REGISTRANTS[ev.id];
}

export interface ClubJoinRequest {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  club_en: string;
  club_ar: string;
  advisor_en: string;
  advisor_ar: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

const CLUB_JOIN_REQUESTS: ClubJoinRequest[] = [
  { id: 'clr1', student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    club_en: 'Debate Club', club_ar: 'نادي المناظرات',
    advisor_en: 'Dr. Layla Al-Rashid', advisor_ar: 'د. ليلى الرشيد',
    status: 'pending', submitted_at: '2026-04-23T09:00:00Z' },
  { id: 'clr2', student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    club_en: 'Computer Science Club', club_ar: 'نادي علوم الحاسوب',
    advisor_en: 'Dr. Omar Al-Barno', advisor_ar: 'د. عمر البرنو',
    status: 'pending', submitted_at: '2026-04-24T11:30:00Z' },
  { id: 'clr3', student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    club_en: 'Media Club', club_ar: 'النادي الإعلامي',
    advisor_en: 'Dalal Al-Fadhli', advisor_ar: 'دلال الفضلي',
    status: 'approved', submitted_at: '2026-04-15T08:00:00Z' },
  { id: 'clr4', student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    club_en: 'Community Club', club_ar: 'نادي المجتمع',
    advisor_en: 'Dalal Al-Fadhli', advisor_ar: 'دلال الفضلي',
    status: 'pending', submitted_at: '2026-04-26T10:15:00Z' },
];

/* ─── Schedule Process & Rules ─── */

export interface ScheduleHall {
  id: string;
  name_en: string;
  name_ar: string;
  type: 'lecture' | 'lab';
  capacity: number;
}

const SCHEDULE_HALLS: ScheduleHall[] = [
  { id: 'h1', name_en: 'Lecture Hall A-101', name_ar: 'قاعة المحاضرات A-101', type: 'lecture', capacity: 40 },
  { id: 'h2', name_en: 'Lecture Hall A-102', name_ar: 'قاعة المحاضرات A-102', type: 'lecture', capacity: 35 },
  { id: 'h3', name_en: 'Lecture Hall B-201', name_ar: 'قاعة المحاضرات B-201', type: 'lecture', capacity: 50 },
  { id: 'h4', name_en: 'Computer Lab CP-1', name_ar: 'مختبر الحاسوب CP-1', type: 'lab', capacity: 24 },
  { id: 'h5', name_en: 'Computer Lab CP-2', name_ar: 'مختبر الحاسوب CP-2', type: 'lab', capacity: 24 },
  { id: 'h6', name_en: 'Media Lab IMD-1', name_ar: 'مختبر الوسائط IMD-1', type: 'lab', capacity: 20 },
];

export interface MergedCoursePair {
  code_a: string;
  code_b: string;
  title_en: string;
  title_ar: string;
}

// Dual-coded (merged) courses must be scheduled in the same hall at the same
// time (Schedule Process and Rules doc).
const MERGED_COURSE_PAIRS: MergedCoursePair[] = [
  { code_a: 'ACC0014', code_b: 'ACC2201', title_en: 'Financial Accounting I', title_ar: 'المحاسبة المالية ١' },
  { code_a: 'ENL0013', code_b: 'ENL1813', title_en: 'Communications I', title_ar: 'الاتصالات ١' },
];

/* ─── IT Helpdesk ─── */

export type ITCategory = 'account_access' | 'sis_lms' | 'device';
export type ITOriginDept = 'registration' | 'finance' | 'admissions' | 'student_life' | 'academic' | 'it';

// Common problems grouped by category (CCK Hub IT Department doc).
export const IT_PROBLEMS: Record<ITCategory, string[]> = {
  account_access: ['login', 'email_activation', 'password_reset', 'office_activation'],
  sis_lms: ['timetable_missing', 'course_data_inaccuracy', 'course_not_in_lms', 'sis_lms_mismatch', 'name_spelling', 'file_upload'],
  device: ['menu_navigation', 'ipad_display', 'seb_issue'],
};

export interface ITTicket {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  category: ITCategory;
  problem_key: string;
  origin_department: ITOriginDept;
  status: 'open' | 'in_progress' | 'resolved';
  assigned_to_en: string | null;
  assigned_to_ar: string | null;
  created_at: string;
  description: string;
}

const IT_TICKETS: ITTicket[] = [
  { id: 'IT-2026-051', student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    category: 'account_access', problem_key: 'password_reset', origin_department: 'it',
    status: 'open', assigned_to_en: null, assigned_to_ar: null, created_at: '2026-04-26T08:10:00Z',
    description: 'Cannot reset CCK-Hub password — reset email never arrives.' },
  { id: 'IT-2026-052', student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    category: 'sis_lms', problem_key: 'timetable_missing', origin_department: 'registration',
    status: 'in_progress', assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني',
    created_at: '2026-04-25T11:30:00Z', description: 'Timetable not showing in SIS on iPad.' },
  { id: 'IT-2026-053', student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    category: 'sis_lms', problem_key: 'name_spelling', origin_department: 'admissions',
    status: 'open', assigned_to_en: null, assigned_to_ar: null, created_at: '2026-04-25T09:00:00Z',
    description: 'Student name is misspelled in SIS and LMS.' },
  { id: 'IT-2026-054', student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    category: 'device', problem_key: 'seb_issue', origin_department: 'academic',
    status: 'in_progress', assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني',
    created_at: '2026-04-24T14:20:00Z', description: 'Safe Exam Browser fails to launch before the midterm.' },
  { id: 'IT-2026-055', student_id: '20240118', student_name_en: 'Noura Al-Shahri', student_name_ar: 'نورة الشهري',
    category: 'account_access', problem_key: 'office_activation', origin_department: 'it',
    status: 'resolved', assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني',
    created_at: '2026-04-18T10:00:00Z', description: 'Microsoft Office activation on a personal device.' },
];

export interface DirectoryEntry {
  id: string;
  name_en: string;
  name_ar: string;
  department_en: string;
  department_ar: string;
  email: string;
  phone: string;
}

const DIRECTORY_ENTRIES: DirectoryEntry[] = [
  { id: 'd1', name_en: 'Registration Office', name_ar: 'مكتب التسجيل',
    department_en: 'Registration', department_ar: 'التسجيل',
    email: 'registration@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd2', name_en: 'Admission Office', name_ar: 'مكتب القبول',
    department_en: 'Admission', department_ar: 'القبول',
    email: 'admission@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd3', name_en: 'Finance Department', name_ar: 'قسم المالية',
    department_en: 'Finance', department_ar: 'المالية',
    email: 'finance@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd4', name_en: 'Student Life', name_ar: 'الحياة الطلابية',
    department_en: 'Student Affairs', department_ar: 'شؤون الطلاب',
    email: 'studentlife@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd5', name_en: 'Faculty of Business', name_ar: 'كلية الأعمال',
    department_en: 'Academics', department_ar: 'الأكاديمي',
    email: 'business.faculty@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd6', name_en: 'Faculty of Engineering Technology', name_ar: 'كلية هندسة التكنولوجيا',
    department_en: 'Academics', department_ar: 'الأكاديمي',
    email: 'engineering.faculty@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd7', name_en: 'IT Helpdesk', name_ar: 'الدعم التقني',
    department_en: 'IT', department_ar: 'تقنية المعلومات',
    email: 'helpdesk@cck.edu.kw', phone: '+965 1842 426' },
];

const STAFF_DASHBOARD_ACTIVITY = [
  { id: 'a1', label_en: 'You completed REQ-2026-0420 (TWIMC)', label_ar: 'أنجزت الطلب REQ-2026-0420 (إلى من يهمه الأمر)', timestamp: '2026-04-26T08:00:00Z' },
  { id: 'a2', label_en: 'New applicant ADM-2026-105 advanced to Registration', label_ar: 'تقدم المتقدم ADM-2026-105 لمرحلة التسجيل', timestamp: '2026-04-26T07:30:00Z' },
  { id: 'a3', label_en: 'Lina Al-Otaibi submitted an Excused Absence', label_ar: 'قدّمت لينا العتيبي عذر غياب', timestamp: '2026-04-26T07:20:00Z' },
  { id: 'a4', label_en: 'FA decision pending - BUS 201 Section A (2 students)', label_ar: 'قرار FA معلق - BUS 201 شعبة A (طالبان)', timestamp: '2026-04-25T16:00:00Z' },
];

export const api = {
  getEngagement: async () => withErrorHandling('getEngagement', async () => { await delay(); return ENGAGEMENT; }),
  getRetention: async () => withErrorHandling('getRetention', async () => { await delay(); return RETENTION; }),
  getAtRiskStudents: async () => withErrorHandling('getAtRiskStudents', async () => { await delay(); return AT_RISK_STUDENTS; }),
  intervene: async (id: string, body: Record<string, unknown>) => withErrorHandling('intervene', async () => {
    await delay();
    return { intervention_id: `int_${Date.now()}`, student_id: id, action: body.action, status: 'scheduled' };
  }),
  sendCommunication: async (body: Record<string, unknown>) => withErrorHandling('sendCommunication', async () => {
    await delay(500);
    return { message_id: `comm_${Date.now()}`, recipients_count: 342, status: 'queued', ...body };
  }),
  getBranding: async () => withErrorHandling('getBranding', async () => { await delay(); return { university_name_en: 'Canadian College of Kuwait', university_name_ar: 'الكلية الكندية في الكويت', primary_color: '#006341', secondary_color: '#76B82A' }; }),
  updateBranding: async (body: Record<string, unknown>) => withErrorHandling('updateBranding', async () => { await delay(500); return { ...body, updated_at: new Date().toISOString() }; }),
  getUsers: async () => withErrorHandling('getUsers', async () => { await delay(); return ADMIN_USERS; }),
  createUser: async (body: Record<string, unknown>) => withErrorHandling('createUser', async () => {
    await delay(500);
    return { id: `admin_${Date.now()}`, ...body, status: 'active', created_at: new Date().toISOString(), last_login: null };
  }),
  updateRole: async (id: string, role: string) => withErrorHandling('updateRole', async () => { await delay(); return { id, role, updated_at: new Date().toISOString() }; }),
  importStudents: async (_body: Record<string, unknown>) => withErrorHandling('importStudents', async () => {
    await delay(800);
    return { import_id: `imp_${Date.now()}`, total_records: 150, successful: 148, failed: 2 };
  }),
  exportStudents: async () => withErrorHandling('exportStudents', async () => { await delay(); return { export_id: `exp_${Date.now()}`, total_records: 4200 }; }),
  getIntegrations: async () => withErrorHandling('getIntegrations', async () => { await delay(); return INTEGRATIONS; }),
  triggerSync: async () => withErrorHandling('triggerSync', async () => { await delay(500); return { sync_id: `sync_${Date.now()}`, status: 'started' }; }),
  getStudentProfile: async (id: string) => withErrorHandling('getStudentProfile', async () => { await delay(); return STUDENT_PROFILES[id] || generateProfile(id); }),
  getAuditLog: async () => withErrorHandling('getAuditLog', async () => { await delay(); return AUDIT_LOG; }),
  getPaymentAnalytics: async () => withErrorHandling('getPaymentAnalytics', async () => { await delay(); return PAYMENT_ANALYTICS; }),

  // Finance Department - accounts, installments & clearances
  getFinanceOverview: async () => withErrorHandling('getFinanceOverview', async () => {
    await delay();
    const accounts = FINANCE_STUDENTS.map(buildFinanceAccount);
    return {
      current_study_week: CURRENT_STUDY_WEEK,
      installment_weeks: [...INSTALLMENT_WEEKS],
      summary: {
        total_billed: r2(accounts.reduce((s, a) => s + a.total_payable, 0)),
        total_collected: r2(accounts.reduce((s, a) => s + a.paid_amount, 0)),
        outstanding: r2(accounts.reduce((s, a) => s + a.balance, 0)),
        holds: accounts.filter((a) => a.standing === 'hold').length,
        overdue_installments: accounts.reduce(
          (s, a) => s + a.installments.filter((i) => i.status === 'overdue').length, 0),
      },
      accounts,
    };
  }),
  getFinanceClearances: async () => withErrorHandling('getFinanceClearances', async () => {
    await delay();
    return FINANCE_CLEARANCES.map((c) => ({ ...c }));
  }),
  resolveFinanceClearance: async (id: string, decision: 'cleared' | 'blocked') =>
    withErrorHandling('resolveFinanceClearance', async () => {
      await delay(400);
      const clearance = FINANCE_CLEARANCES.find((c) => c.id === id);
      if (clearance) clearance.status = decision;
      return { id, status: decision, resolved_at: new Date().toISOString() };
    }),
  sendFinanceReminder: async (studentId: string, channel: 'email' | 'push') =>
    withErrorHandling('sendFinanceReminder', async () => {
      await delay(600);
      return { student_id: studentId, channel, sent_at: new Date().toISOString() };
    }),
  getAIMonitoring: async () => withErrorHandling('getAIMonitoring', async () => { await delay(); return AI_MONITORING; }),
  getContent: async () => withErrorHandling('getContent', async () => { await delay(); return CONTENT_ITEMS; }),
  approveContent: async (type: string, id: string) => withErrorHandling('approveContent', async () => { await delay(); return { type, id, status: 'approved' }; }),

  // Settings - General & Security
  updateGeneralSettings: async (body: Record<string, unknown>) => withErrorHandling('updateGeneralSettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),
  updateSecuritySettings: async (body: Record<string, unknown>) => withErrorHandling('updateSecuritySettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),

  // Retention - interventions & outcomes
  logIntervention: async (studentId: string, intervention: Record<string, unknown>) => withErrorHandling('logIntervention', async () => {
    await delay();
    return { id: 'int_' + Date.now(), student_id: studentId, ...intervention, logged_at: new Date().toISOString() };
  }),
  updateOutcome: async (studentId: string, outcome: string) => withErrorHandling('updateOutcome', async () => {
    await delay();
    return { student_id: studentId, outcome, updated_at: new Date().toISOString() };
  }),

  // Communications - sent history
  getSentCommunications: async () => withErrorHandling('getSentCommunications', async () => {
    await delay();
    return [...SENT_MESSAGES];
  }),

  // Integrations - reconnect
  reconnectIntegration: async (adapterId: string) => withErrorHandling('reconnectIntegration', async () => {
    await delay(500);
    return { adapter_id: adapterId, status: 'connecting' };
  }),

  // SSO configuration
  getSSOConfig: async () => withErrorHandling('getSSOConfig', async () => {
    await delay();
    return {
      enabled: false,
      provider: 'saml',
      entity_id: '',
      sso_url: '',
      certificate: '',
      attribute_mapping: { email: 'email', name: 'displayName', student_id: 'employeeNumber' },
    };
  }),
  updateSSOConfig: async (body: Record<string, unknown>) => withErrorHandling('updateSSOConfig', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),

  // Feature usage heatmap
  getFeatureHeatmap: async () => withErrorHandling('getFeatureHeatmap', async () => {
    await delay();
    return FEATURE_HEATMAP;
  }),

  // Campus directory
  getCampusDirectory: async () => withErrorHandling('getCampusDirectory', async () => {
    await delay();
    return CAMPUS_DIRECTORY;
  }),
  updateDirectoryItem: async (id: string, body: Record<string, unknown>) => withErrorHandling('updateDirectoryItem', async () => {
    await delay(500);
    return { id, ...body, updated_at: new Date().toISOString() };
  }),

  // Follow-up reminders
  getFollowUpReminders: async () => withErrorHandling('getFollowUpReminders', async () => {
    await delay();
    return FOLLOW_UP_REMINDERS;
  }),
  dismissReminder: async (id: string) => withErrorHandling('dismissReminder', async () => {
    await delay();
    return { id, dismissed: true };
  }),

  // Risk recalculation info
  getRiskRecalcInfo: async () => withErrorHandling('getRiskRecalcInfo', async () => {
    await delay();
    return { last_calculated: '2026-04-07T03:00:00Z', next_scheduled: '2026-04-14T03:00:00Z', model_version: 'v2.1' };
  }),

  // Export students with filters
  exportStudentsFiltered: async (filters: Record<string, unknown>) => withErrorHandling('exportStudentsFiltered', async () => {
    await delay(500);
    return { export_id: `exp_${Date.now()}`, total_records: 4200, filters_applied: filters, format: 'csv' };
  }),

  // Bulk operations
  bulkUpdateRole: async (userIds: string[], role: string) => withErrorHandling('bulkUpdateRole', async () => {
    await delay(500);
    return { updated: userIds.length, role, updated_at: new Date().toISOString() };
  }),
  bulkSuspend: async (userIds: string[]) => withErrorHandling('bulkSuspend', async () => {
    await delay(500);
    return { suspended: userIds.length, updated_at: new Date().toISOString() };
  }),

  /* ─── CCK-Hub workflow APIs ─── */

  getStaffDashboard: async () => withErrorHandling('getStaffDashboard', async () => {
    await delay();
    const open = STUDENT_REQUESTS.filter((r) => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected');
    const inProgress = STUDENT_REQUESTS.filter((r) => r.status === 'in_progress').length;
    const submitted = STUDENT_REQUESTS.filter((r) => r.status === 'submitted').length;
    const completed = STUDENT_REQUESTS.filter((r) => r.status === 'completed').length;
    const queues = [
      { key: 'requests', label_en: 'Student Requests', label_ar: 'طلبات الطلاب',
        href: '/requests', open: open.length, in_progress: inProgress, completed },
      { key: 'admissions', label_en: 'Admissions', label_ar: 'القبول',
        href: '/admissions', open: ADMISSION_APPLICANTS.filter((a) => a.stage !== 'completed').length,
        in_progress: ADMISSION_APPLICANTS.filter((a) => a.stage !== 'completed' && a.stage !== 'admission').length,
        completed: ADMISSION_APPLICANTS.filter((a) => a.stage === 'completed').length },
      { key: 'social', label_en: 'Social Allowance', label_ar: 'الإعانة الاجتماعية',
        href: '/social-allowance',
        open: SOCIAL_APPLICATIONS.filter((s) => s.status !== 'completed').length,
        in_progress: SOCIAL_APPLICATIONS.filter((s) => s.status === 'in_progress').length,
        completed: SOCIAL_APPLICATIONS.filter((s) => s.status === 'completed').length },
      { key: 'appeals', label_en: 'Appeals', label_ar: 'التظلمات',
        href: '/appeals',
        open: APPEALS.filter((a) => a.status !== 'completed').length,
        in_progress: APPEALS.filter((a) => a.status === 'in_progress').length,
        completed: APPEALS.filter((a) => a.status === 'completed').length },
      { key: 'fa', label_en: 'FA Decisions', label_ar: 'قرارات FA',
        href: '/fa-screen',
        open: FA_ROSTERS.reduce((acc, r) => acc + r.students.filter((s) => s.decision === 'pending').length, 0),
        in_progress: 0,
        completed: FA_ROSTERS.reduce((acc, r) => acc + r.students.filter((s) => s.decision !== 'pending').length, 0) },
      { key: 'feedback', label_en: 'Complaints & Suggestions', label_ar: 'الشكاوى والمقترحات',
        href: '/feedback',
        open: FEEDBACK_ENTRIES.filter((f) => f.status !== 'resolved').length,
        in_progress: FEEDBACK_ENTRIES.filter((f) => f.status === 'in_progress').length,
        completed: FEEDBACK_ENTRIES.filter((f) => f.status === 'resolved').length },
    ];
    const alerts = open
      .map((r) => {
        const ageDays = Math.floor((Date.now() - new Date(r.submitted_at).getTime()) / 86_400_000);
        return { id: r.id, type: r.type, student_name_en: r.student_name_en, student_name_ar: r.student_name_ar,
          age_days: ageDays, overdue: ageDays > 5 };
      })
      .filter((a) => a.age_days >= 4)
      .sort((a, b) => b.age_days - a.age_days);
    return {
      stats: {
        assigned_to_me: STUDENT_REQUESTS.filter((r) => r.assigned_to_en === 'Noura Al-Shahri' && r.status !== 'completed').length,
        open: open.length,
        due_today: alerts.filter((a) => !a.overdue && a.age_days >= 4).length,
        overdue: alerts.filter((a) => a.overdue).length,
        completed_this_week: completed,
      },
      queues,
      alerts: alerts.slice(0, 6),
      recent_activity: STAFF_DASHBOARD_ACTIVITY,
    };
  }),

  getRequests: async () => withErrorHandling('getRequests', async () => {
    await delay();
    return [...STUDENT_REQUESTS].sort((a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }),

  getRequest: async (id: string) => withErrorHandling('getRequest', async () => {
    await delay();
    return STUDENT_REQUESTS.find((r) => r.id === id) ?? null;
  }),

  updateRequestStatus: async (id: string, status: RequestStatus) => withErrorHandling('updateRequestStatus', async () => {
    await delay();
    return { id, status, updated_at: new Date().toISOString() };
  }),

  // Rejecting a request records the reason and emails it to the student
  // (CCK Hub Update.pdf — rejections must notify the student with a reason).
  rejectRequest: async (id: string, reason: string) => withErrorHandling('rejectRequest', async () => {
    await delay(400);
    return {
      id, status: 'rejected' as RequestStatus, rejection_reason: reason,
      student_notified: true, rejected_at: new Date().toISOString(),
    };
  }),

  assignRequest: async (id: string, assignee: { en: string; ar: string } | null) => withErrorHandling('assignRequest', async () => {
    await delay();
    return { id, assignee, updated_at: new Date().toISOString() };
  }),

  getAssignableStaff: async () => withErrorHandling('getAssignableStaff', async () => {
    await delay(200);
    return [...ASSIGNABLE_STAFF];
  }),

  addRequestComment: async (id: string, body: string) => withErrorHandling('addRequestComment', async () => {
    await delay();
    return { id: `c_${Date.now()}`, request_id: id, body, created_at: new Date().toISOString() };
  }),

  notifyRequestStudent: async (id: string) => withErrorHandling('notifyRequestStudent', async () => {
    await delay(400);
    return { id, notified: true, sent_at: new Date().toISOString() };
  }),

  getAdmissionApplicants: async () => withErrorHandling('getAdmissionApplicants', async () => {
    await delay();
    return [...ADMISSION_APPLICANTS];
  }),

  decideAdmission: async (id: string, decision: 'approve' | 'reject', comment: string) => withErrorHandling('decideAdmission', async () => {
    await delay(400);
    return { id, decision, comment, decided_at: new Date().toISOString() };
  }),

  generateAcceptanceLetter: async (id: string) => withErrorHandling('generateAcceptanceLetter', async () => {
    await delay(500);
    return { id, letter_id: `letter_${Date.now()}`, generated_at: new Date().toISOString() };
  }),

  // Registration's final enrolment step — issues the SIS Student ID and
  // closes the admission file (Admission-Registration Workflow doc).
  generateSisStudentId: async (id: string) => withErrorHandling('generateSisStudentId', async () => {
    await delay(500);
    const year = new Date().getFullYear();
    const sis_student_id = `${year}${Math.floor(1000 + Math.random() * 9000)}`;
    return { id, sis_student_id, issued_at: new Date().toISOString() };
  }),

  // Admission staff opens a new student digital file (Admission-Registration
  // Workflow doc — "Admission creates new student file").
  createAdmissionApplicant: async (body: Record<string, unknown>) =>
    withErrorHandling('createAdmissionApplicant', async () => {
      await delay(500);
      return {
        id: `ADM-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
        ...body,
        stage: 'admission',
        acceptance_letter_generated: false,
        submitted_at: new Date().toISOString(),
      };
    }),

  // Admission team creates an Industrial Certificate request, which routes to
  // Registration to prepare the PUC letter (CCK Hub Update.pdf).
  createIndustrialCertRequest: async (applicantId: string) =>
    withErrorHandling('createIndustrialCertRequest', async () => {
      await delay(400);
      return {
        request_id: `REQ-${new Date().getFullYear()}-IC-${Date.now().toString().slice(-4)}`,
        type: 'industrial_cert' as RequestType,
        applicant_id: applicantId,
        routed_to: 'registration',
        created_at: new Date().toISOString(),
      };
    }),

  getSocialApplications: async () => withErrorHandling('getSocialApplications', async () => {
    await delay();
    return [...SOCIAL_APPLICATIONS];
  }),

  updateSocialStatus: async (id: string, status: SocialApplication['status']) => withErrorHandling('updateSocialStatus', async () => {
    await delay();
    return { id, status, updated_at: new Date().toISOString() };
  }),

  markSocialSentToPuc: async (id: string) => withErrorHandling('markSocialSentToPuc', async () => {
    await delay();
    return { id, sent_to_puc: true, updated_at: new Date().toISOString() };
  }),

  getAppeals: async () => withErrorHandling('getAppeals', async () => {
    await delay();
    return [...APPEALS];
  }),

  getAppealsReleaseStatus: async () => withErrorHandling('getAppealsReleaseStatus', async () => {
    await delay();
    return { released: true };
  }),

  toggleAppealsRelease: async () => withErrorHandling('toggleAppealsRelease', async () => {
    await delay();
    return { released: false };
  }),

  getFaRosters: async () => withErrorHandling('getFaRosters', async () => {
    await delay();
    return [...FA_ROSTERS];
  }),

  decideFa: async (studentRowId: string, decision: 'fa_admitted' | 'absence_removed') => withErrorHandling('decideFa', async () => {
    await delay();
    return { id: studentRowId, decision, updated_at: new Date().toISOString() };
  }),

  getWarnings: async () => withErrorHandling('getWarnings', async () => {
    await delay();
    return [...WARNINGS];
  }),

  markWarningSigned: async (id: string) => withErrorHandling('markWarningSigned', async () => {
    await delay();
    return { id, signed_at: new Date().toISOString() };
  }),

  getFeedback: async () => withErrorHandling('getFeedback', async () => {
    await delay();
    return [...FEEDBACK_ENTRIES];
  }),

  resolveFeedback: async (id: string) => withErrorHandling('resolveFeedback', async () => {
    await delay();
    return { id, status: 'resolved', updated_at: new Date().toISOString() };
  }),

  getSportApplications: async () => withErrorHandling('getSportApplications', async () => {
    await delay();
    return [...SPORT_APPLICATIONS];
  }),

  decideSport: async (id: string, decision: 'approved' | 'rejected') => withErrorHandling('decideSport', async () => {
    await delay();
    return { id, status: decision, updated_at: new Date().toISOString() };
  }),

  // Student Life — events
  getStudentLifeEvents: async () => withErrorHandling('getStudentLifeEvents', async () => {
    await delay();
    return [...STUDENT_LIFE_EVENTS];
  }),
  getStudentLifeEvent: async (id: string) => withErrorHandling('getStudentLifeEvent', async () => {
    await delay();
    const ev = STUDENT_LIFE_EVENTS.find((e) => e.id === id);
    if (!ev) throw new Error('Event not found');
    const detail: StudentLifeEventDetail = {
      ...ev,
      registrants: registrantsFor(ev),
      notifications: EVENT_NOTIFICATIONS[ev.id] ?? [],
    };
    return detail;
  }),
  createStudentLifeEvent: async (body: Omit<StudentLifeEvent, 'id' | 'registrations'>) => withErrorHandling('createStudentLifeEvent', async () => {
    await delay(500);
    const ev: StudentLifeEvent = { ...body, id: `evt_${Date.now()}`, registrations: 0 };
    STUDENT_LIFE_EVENTS.push(ev);
    return ev;
  }),
  toggleEventRegistration: async (id: string, open: boolean) => withErrorHandling('toggleEventRegistration', async () => {
    await delay();
    const ev = STUDENT_LIFE_EVENTS.find((e) => e.id === id);
    if (ev) ev.registration_open = open;
    return { id, registration_open: open, updated_at: new Date().toISOString() };
  }),
  sendEventNotification: async (
    eventId: string,
    payload: { title: string; body: string; target: 'registered' | 'audience' },
  ) => withErrorHandling('sendEventNotification', async () => {
    await delay(600);
    const ev = STUDENT_LIFE_EVENTS.find((e) => e.id === eventId);
    const recipients = payload.target === 'registered'
      ? (ev?.registrations ?? 0)
      : (ev?.audience_size ?? 0);
    const ntf: EventNotification = {
      id: `ntf_${Date.now()}`,
      title: payload.title,
      body: payload.body,
      target: payload.target,
      recipients,
      sent_at: new Date().toISOString(),
    };
    EVENT_NOTIFICATIONS[eventId] = [ntf, ...(EVENT_NOTIFICATIONS[eventId] ?? [])];
    return ntf;
  }),

  // Student Life — club joining requests routed to the Club Advisor
  getClubJoinRequests: async () => withErrorHandling('getClubJoinRequests', async () => {
    await delay();
    return [...CLUB_JOIN_REQUESTS];
  }),
  decideClubRequest: async (id: string, decision: 'approved' | 'rejected') => withErrorHandling('decideClubRequest', async () => {
    await delay();
    return { id, status: decision, updated_at: new Date().toISOString() };
  }),

  // Student Life — complaint committee loop
  sendComplaintToCommittee: async (id: string) => withErrorHandling('sendComplaintToCommittee', async () => {
    await delay(400);
    return { id, committee_stage: 'with_committee' as CommitteeStage, sent_at: new Date().toISOString() };
  }),
  recordCommitteeDecision: async (id: string, decision: string) => withErrorHandling('recordCommitteeDecision', async () => {
    await delay(400);
    return { id, committee_stage: 'decided' as CommitteeStage, committee_decision: decision, decided_at: new Date().toISOString() };
  }),

  getDirectory: async () => withErrorHandling('getDirectory', async () => {
    await delay();
    return [...DIRECTORY_ENTRIES];
  }),

  // Schedule Process & Rules — halls and merged-course reference
  getScheduleConfig: async () => withErrorHandling('getScheduleConfig', async () => {
    await delay();
    return { halls: [...SCHEDULE_HALLS], merged_courses: [...MERGED_COURSE_PAIRS] };
  }),

  // IT Helpdesk — ticket queue
  getITTickets: async () => withErrorHandling('getITTickets', async () => {
    await delay();
    return [...IT_TICKETS].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }),
  updateITTicketStatus: async (id: string, status: ITTicket['status']) => withErrorHandling('updateITTicketStatus', async () => {
    await delay();
    return { id, status, updated_at: new Date().toISOString() };
  }),
  assignITTicket: async (id: string, assignee: { en: string; ar: string }) => withErrorHandling('assignITTicket', async () => {
    await delay();
    return { id, assignee, updated_at: new Date().toISOString() };
  }),

  // PAAET ↔ CCK transfer-credit equivalency reference (real data, @masari/shared)
  getEquivalency: async () => withErrorHandling('getEquivalency', async () => {
    await delay();
    return { entries: EQUIVALENCY, paaet_entries: PAAET_EQUIVALENCY, rules: EQUIVALENCY_RULES };
  }),
};
