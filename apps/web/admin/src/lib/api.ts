// Mock data — MVP standalone, no backend required

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
      { date: 'Mar 28', action: 'Opened AI Advisor — asked about withdrawal' },
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
      { date: 'Apr 3', action: 'Checked payment — saw overdue notice' },
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
  by_method: [
    { method: 'KNET', count: 2840, amount: 9650000, percentage: 58.0 },
    { method: 'Credit Card', count: 1250, amount: 4320000, percentage: 26.0 },
    { method: 'Bank Transfer', count: 480, amount: 2150000, percentage: 12.9 },
    { method: 'Cash', count: 120, amount: 512000, percentage: 3.1 },
  ],
  overdue_by_college: [
    { college: 'Engineering', students: 45, amount: 720000 },
    { college: 'Business', students: 38, amount: 580000 },
    { college: 'Computer Science', students: 22, amount: 420000 },
    { college: 'Science', students: 18, amount: 310000 },
    { college: 'Arts', students: 15, amount: 238000 },
  ],
};

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
  clubs: [
    { id: 'club_1', name_en: 'Robotics Society', name_ar: 'جمعية الروبوتات', members: 45, status: 'approved', advisor: 'Dr. Hassan' },
    { id: 'club_2', name_en: 'Debate Club', name_ar: 'نادي المناظرات', members: 32, status: 'pending', advisor: 'Dr. Layla' },
    { id: 'club_3', name_en: 'Photography Club', name_ar: 'نادي التصوير', members: 28, status: 'approved', advisor: 'Prof. Saleh' },
    { id: 'club_4', name_en: 'Entrepreneurship Hub', name_ar: 'مركز ريادة الأعمال', members: 67, status: 'approved', advisor: 'Dr. Nasser' },
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
    hours_en: 'Sun–Thu 8:00–16:00', hours_ar: 'الأحد–الخميس ٨:٠٠–١٦:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_2', type: 'office' as const,
    name_en: 'Registrar Office', name_ar: 'مكتب القبول والتسجيل',
    location_en: 'Admin Building, Floor 2', location_ar: 'مبنى الإدارة، الطابق الثاني',
    phone: '+966-11-467-1111', email: 'registrar@ksu.edu.sa',
    hours_en: 'Sun–Thu 9:00–15:00', hours_ar: 'الأحد–الخميس ٩:٠٠–١٥:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_3', type: 'service' as const,
    name_en: 'Student Health Center', name_ar: 'مركز صحة الطلاب',
    location_en: 'Building 14', location_ar: 'مبنى ١٤',
    phone: '+966-11-467-2222', email: 'health@ksu.edu.sa',
    hours_en: 'Sun–Thu 8:00–20:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٠:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_4', type: 'service' as const,
    name_en: 'IT Help Desk', name_ar: 'مكتب الدعم التقني',
    location_en: 'Library Building, Ground Floor', location_ar: 'مبنى المكتبة، الطابق الأرضي',
    phone: '+966-11-467-3333', email: 'it@ksu.edu.sa',
    hours_en: 'Sun–Thu 8:00–22:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٢:٠٠',
    status: 'draft' as const,
  },
  {
    id: 'dir_5', type: 'building' as const,
    name_en: 'College of Computer Science', name_ar: 'كلية علوم الحاسب',
    location_en: 'North Campus', location_ar: 'الحرم الشمالي',
    phone: '+966-11-467-4444', email: 'cs@ksu.edu.sa',
    hours_en: 'Sun–Thu 7:30–21:00', hours_ar: 'الأحد–الخميس ٧:٣٠–٢١:٠٠',
    status: 'published' as const,
  },
];

const FEATURE_HEATMAP = {
  features: ['Schedule View', 'Grade Check', 'Payment Portal', 'AI Advisor', 'Campus Events', 'Social Feed', 'Library Search', 'Club Activities'],
  features_ar: ['عرض الجدول', 'التحقق من الدرجات', 'بوابة الدفع', 'المستشار الذكي', 'فعاليات الحرم', 'المنشورات', 'بحث المكتبة', 'أنشطة الأندية'],
  hours: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'],
  hours_ar: ['٨ص', '٩ص', '١٠ص', '١١ص', '١٢م', '١م', '٢م', '٣م', '٤م', '٥م', '٦م', '٧م', '٨م', '٩م', '١٠م'],
  data: [
    // Schedule View — peaks in morning
    [85, 92, 78, 45, 30, 35, 28, 22, 18, 15, 12, 10, 8, 6, 4],
    // Grade Check — peaks around midday
    [20, 35, 55, 72, 80, 88, 75, 60, 50, 42, 38, 30, 45, 55, 35],
    // Payment Portal — spikes around 10–1
    [10, 15, 45, 60, 55, 50, 35, 25, 20, 18, 15, 12, 10, 8, 5],
    // AI Advisor — steady afternoon/evening
    [8, 12, 18, 25, 30, 38, 42, 48, 52, 55, 58, 60, 65, 62, 45],
    // Campus Events — peaks late afternoon
    [5, 8, 12, 15, 18, 22, 28, 35, 45, 55, 60, 52, 40, 30, 18],
    // Social Feed — peaks evening
    [3, 5, 8, 12, 18, 25, 30, 35, 42, 50, 60, 72, 80, 75, 55],
    // Library Search — peaks mid-morning
    [15, 25, 40, 55, 48, 35, 28, 22, 18, 15, 12, 10, 15, 20, 12],
    // Club Activities — peaks late afternoon
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
  getAIMonitoring: async () => withErrorHandling('getAIMonitoring', async () => { await delay(); return AI_MONITORING; }),
  getContent: async () => withErrorHandling('getContent', async () => { await delay(); return CONTENT_ITEMS; }),
  approveContent: async (type: string, id: string) => withErrorHandling('approveContent', async () => { await delay(); return { type, id, status: 'approved' }; }),

  // Settings — General & Security
  updateGeneralSettings: async (body: Record<string, unknown>) => withErrorHandling('updateGeneralSettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),
  updateSecuritySettings: async (body: Record<string, unknown>) => withErrorHandling('updateSecuritySettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),

  // Retention — interventions & outcomes
  logIntervention: async (studentId: string, intervention: Record<string, unknown>) => withErrorHandling('logIntervention', async () => {
    await delay();
    return { id: 'int_' + Date.now(), student_id: studentId, ...intervention, logged_at: new Date().toISOString() };
  }),
  updateOutcome: async (studentId: string, outcome: string) => withErrorHandling('updateOutcome', async () => {
    await delay();
    return { student_id: studentId, outcome, updated_at: new Date().toISOString() };
  }),

  // Communications — sent history
  getSentCommunications: async () => withErrorHandling('getSentCommunications', async () => {
    await delay();
    return [...SENT_MESSAGES];
  }),

  // Integrations — reconnect
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
};
