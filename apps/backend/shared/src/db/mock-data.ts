// Fallback mock data when PostgreSQL is not available
// Mirrors the seed data structure

const universityId = '550e8400-e29b-41d4-a716-446655440000';
const studentId = '770e8400-e29b-41d4-a716-446655440002';
const termId = '660e8400-e29b-41d4-a716-446655440001';

export const mockStudent = {
  id: studentId,
  university_id: universityId,
  student_number: '202401001',
  name_ar: 'نورة الصباح',
  name_en: 'Noura Al-Sabah',
  email: 'noura@cck.edu.kw',
  phone: '+96599001234',
  major_name_ar: 'علوم الحاسب',
  major_name_en: 'Computer Science',
  cohort_year: 2024,
  enrollment_status: 'enrolled',
  gpa_cumulative: 3.45,
  preferred_language: 'ar',
  university_name_ar: 'جامعة الخليج للعلوم والتكنولوجيا',
  university_name_en: 'Gulf University for Science and Technology',
  currency: 'KWD',
  timezone: 'Asia/Kuwait',
};

export const mockUniversity = {
  id: universityId,
  name_ar: 'جامعة الخليج للعلوم والتكنولوجيا',
  name_en: 'Gulf University for Science and Technology',
  slug: 'gust',
  country: 'KW',
  primary_color: '#1B4D3E',
  secondary_color: '#D4AF37',
  timezone: 'Asia/Kuwait',
  currency: 'KWD',
  sso_provider: 'saml',
};

export const mockTerm = {
  id: termId,
  university_id: universityId,
  name_ar: 'الفصل الدراسي الثاني ٢٠٢٥-٢٠٢٦',
  name_en: 'Spring Semester 2025-2026',
  start_date: '2026-01-15',
  end_date: '2026-05-30',
  type: 'spring',
};

export const mockSchedule = [
  {
    enrollment_id: 'enr-001',
    status: 'enrolled',
    course_code: 'CS101',
    course_name_ar: 'مقدمة في علوم الحاسب',
    course_name_en: 'Introduction to Computer Science',
    credit_hours: 3,
    schedule_slots: [
      { day: 'sunday', start_time: '08:00', end_time: '09:30', room: 'B-201' },
      { day: 'tuesday', start_time: '08:00', end_time: '09:30', room: 'B-201' },
    ],
    room: 'B-201',
    instructor_name_ar: 'د. أحمد المطيري',
    instructor_name_en: 'Dr. Ahmed Al-Mutairi',
    term_name_ar: mockTerm.name_ar,
    term_name_en: mockTerm.name_en,
  },
  {
    enrollment_id: 'enr-002',
    status: 'enrolled',
    course_code: 'MATH201',
    course_name_ar: 'الرياضيات التطبيقية',
    course_name_en: 'Applied Mathematics',
    credit_hours: 3,
    schedule_slots: [
      { day: 'sunday', start_time: '10:00', end_time: '11:30', room: 'A-105' },
      { day: 'tuesday', start_time: '10:00', end_time: '11:30', room: 'A-105' },
    ],
    room: 'A-105',
    instructor_name_ar: 'د. فاطمة الراشد',
    instructor_name_en: 'Dr. Fatima Al-Rashid',
    term_name_ar: mockTerm.name_ar,
    term_name_en: mockTerm.name_en,
  },
  {
    enrollment_id: 'enr-003',
    status: 'enrolled',
    course_code: 'ENG102',
    course_name_ar: 'اللغة الإنجليزية الأكاديمية',
    course_name_en: 'Academic English',
    credit_hours: 3,
    schedule_slots: [
      { day: 'monday', start_time: '13:00', end_time: '14:30', room: 'C-301' },
      { day: 'wednesday', start_time: '13:00', end_time: '14:30', room: 'C-301' },
    ],
    room: 'C-301',
    instructor_name_ar: 'أ. سارة العنزي',
    instructor_name_en: 'Ms. Sara Al-Enezi',
    term_name_ar: mockTerm.name_ar,
    term_name_en: mockTerm.name_en,
  },
  {
    enrollment_id: 'enr-004',
    status: 'enrolled',
    course_code: 'IS210',
    course_name_ar: 'نظم المعلومات الإدارية',
    course_name_en: 'Management Information Systems',
    credit_hours: 3,
    schedule_slots: [
      { day: 'monday', start_time: '08:00', end_time: '09:30', room: 'D-102' },
      { day: 'wednesday', start_time: '08:00', end_time: '09:30', room: 'D-102' },
    ],
    room: 'D-102',
    instructor_name_ar: 'د. محمد الشمري',
    instructor_name_en: 'Dr. Mohammed Al-Shammari',
    term_name_ar: mockTerm.name_ar,
    term_name_en: mockTerm.name_en,
  },
];

export const mockGrades = {
  cumulative_gpa: 3.45,
  credits_completed: 45,
  academic_standing: 'good_standing',
  gpa_history: [
    { term_name_ar: 'خريف ٢٠٢٤-٢٠٢٥', term_name_en: 'Fall 2024-2025', gpa: 3.2 },
    { term_name_ar: 'ربيع ٢٠٢٤-٢٠٢٥', term_name_en: 'Spring 2024-2025', gpa: 3.35 },
    { term_name_ar: 'خريف ٢٠٢٥-٢٠٢٦', term_name_en: 'Fall 2025-2026', gpa: 3.4 },
    { term_name_ar: 'ربيع ٢٠٢٥-٢٠٢٦', term_name_en: 'Spring 2025-2026', gpa: 3.45 },
  ],
  courses: [
    { enrollment_id: 'enr-001', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', credit_hours: 3, grade: 'A-', grade_points: 3.7, status: 'enrolled', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en, term_id: termId },
    { enrollment_id: 'enr-002', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', credit_hours: 3, grade: 'B+', grade_points: 3.3, status: 'enrolled', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en, term_id: termId },
    { enrollment_id: 'enr-003', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', credit_hours: 3, grade: null, grade_points: null, status: 'enrolled', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en, term_id: termId },
    { enrollment_id: 'enr-004', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', credit_hours: 3, grade: null, grade_points: null, status: 'enrolled', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en, term_id: termId },
  ],
};

export const mockAttendance = [
  { enrollment_id: 'enr-001', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', total_sessions: 8, present: 6, absent: 1, excused: 1, late: 0, attendance_percentage: 75, warning: false },
  { enrollment_id: 'enr-002', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', total_sessions: 8, present: 7, absent: 0, excused: 1, late: 0, attendance_percentage: 87.5, warning: false },
  { enrollment_id: 'enr-003', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', total_sessions: 8, present: 5, absent: 2, excused: 1, late: 0, attendance_percentage: 62.5, warning: true },
  { enrollment_id: 'enr-004', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', total_sessions: 8, present: 8, absent: 0, excused: 0, late: 0, attendance_percentage: 100, warning: false },
];

export const mockAssignments = [
  { id: 'asg-001', title_ar: 'واجب البرمجة الأول', title_en: 'Programming Assignment 1', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', due_date: '2026-04-12T23:59:00Z', max_score: 20, type: 'homework', enrollment_id: 'enr-001' },
  { id: 'asg-002', title_ar: 'اختبار قصير - الأسبوع ٨', title_en: 'Quiz - Week 8', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', due_date: '2026-04-15T23:59:00Z', max_score: 10, type: 'quiz', enrollment_id: 'enr-001' },
  { id: 'asg-003', title_ar: 'حل مسائل التكامل', title_en: 'Integration Problem Set', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', due_date: '2026-04-18T23:59:00Z', max_score: 15, type: 'homework', enrollment_id: 'enr-002' },
  { id: 'asg-004', title_ar: 'مقال أكاديمي', title_en: 'Academic Essay', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', due_date: '2026-04-20T23:59:00Z', max_score: 25, type: 'project', enrollment_id: 'enr-003' },
  { id: 'asg-005', title_ar: 'مشروع قاعدة البيانات', title_en: 'Database Project', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', due_date: '2026-04-25T23:59:00Z', max_score: 30, type: 'project', enrollment_id: 'enr-004' },
];

export const mockFees = {
  balance_due: 500,
  currency: 'KWD',
  next_due_date: '2026-04-30',
  fees: [
    { id: 'fee-001', type: 'tuition', description_ar: 'الرسوم الدراسية', description_en: 'Tuition Fee', amount: 1000, due_date: '2026-02-15', paid_amount: 500, currency: 'KWD', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en },
    { id: 'fee-002', type: 'lab', description_ar: 'رسوم المختبر', description_en: 'Lab Fee', amount: 150, due_date: '2026-02-15', paid_amount: 150, currency: 'KWD', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en },
    { id: 'fee-003', type: 'registration', description_ar: 'رسوم التسجيل', description_en: 'Registration Fee', amount: 100, due_date: '2026-02-01', paid_amount: 100, currency: 'KWD', term_name_ar: mockTerm.name_ar, term_name_en: mockTerm.name_en },
  ],
  recent_payments: [
    { id: 'pay-001', amount: 500, currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-02-10T10:00:00Z' },
    { id: 'pay-002', amount: 250, currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-01-15T09:00:00Z' },
  ],
};

export const mockDegreeAudit = {
  total_credits_required: 136,
  credits_completed: 45,
  credits_in_progress: 12,
  credits_remaining: 79,
  completion_percentage: 33,
  courses: mockGrades.courses.map(c => ({
    code: c.course_code,
    name_ar: c.course_name_ar,
    name_en: c.course_name_en,
    credits: c.credit_hours,
    status: c.grade ? 'completed' : 'in_progress',
    grade: c.grade,
  })),
};

export const mockEvents = [
  { id: 'evt-001', university_id: universityId, title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي', title_en: 'Workshop: Intro to AI', description_ar: 'تعرف على أساسيات الذكاء الاصطناعي', description_en: 'Learn AI fundamentals', start_time: '2026-04-12T14:00:00Z', end_time: '2026-04-12T16:00:00Z', location_ar: 'قاعة المؤتمرات الرئيسية', location_en: 'Main Conference Hall', organizer_type: 'university', category: 'workshop', capacity: 80, rsvp_count: 23, is_rsvped: false },
  { id: 'evt-002', university_id: universityId, title_ar: 'معرض المشاريع الطلابية', title_en: 'Student Projects Exhibition', description_ar: 'عرض مشاريع التخرج والمشاريع الابتكارية', description_en: 'Graduation and innovation projects showcase', start_time: '2026-04-15T10:00:00Z', end_time: '2026-04-15T15:00:00Z', location_ar: 'ساحة الجامعة', location_en: 'University Plaza', organizer_type: 'university', category: 'exhibition', capacity: 200, rsvp_count: 87, is_rsvped: false },
  { id: 'evt-003', university_id: universityId, title_ar: 'محاضرة: ريادة الأعمال في الكويت', title_en: 'Lecture: Entrepreneurship in Kuwait', description_ar: 'محاضرة من رائد أعمال كويتي ناجح', description_en: 'Lecture by a successful Kuwaiti entrepreneur', start_time: '2026-04-18T18:00:00Z', end_time: '2026-04-18T20:00:00Z', location_ar: 'القاعة الكبرى', location_en: 'Grand Hall', organizer_type: 'university', category: 'lecture', capacity: 150, rsvp_count: 45, is_rsvped: false },
];

export const mockClubs = [
  { id: 'club-001', university_id: universityId, name_ar: 'نادي البرمجة', name_en: 'Coding Club', description_ar: 'نادي لمحبي البرمجة وتطوير البرمجيات', description_en: 'A club for coding enthusiasts', category: 'technology', member_count: 45, status: 'active', is_member: false },
  { id: 'club-002', university_id: universityId, name_ar: 'نادي ريادة الأعمال', name_en: 'Entrepreneurship Club', description_ar: 'دعم رواد الأعمال الشباب', description_en: 'Supporting young entrepreneurs', category: 'business', member_count: 32, status: 'active', is_member: false },
  { id: 'club-003', university_id: universityId, name_ar: 'النادي الثقافي', name_en: 'Cultural Club', description_ar: 'فعاليات ثقافية وأدبية متنوعة', description_en: 'Cultural and literary events', category: 'culture', member_count: 58, status: 'active', is_member: true },
];

export const mockStudentSummary = {
  student: mockStudent,
  current_term: { id: termId, name_ar: mockTerm.name_ar, name_en: mockTerm.name_en },
  today_classes_count: 2,
  upcoming_deadlines_count: 3,
  balance_due: 500,
  currency: 'KWD',
};

// Prayer times
export const mockPrayerTimes = {
  date: '2026-04-08',
  hijri_date: '10 شوال 1448',
  location: 'Kuwait City',
  times: {
    fajr: '04:32',
    sunrise: '05:52',
    dhuhr: '11:52',
    asr: '15:18',
    maghrib: '18:12',
    isha: '19:35',
  },
  next_prayer: 'asr',
};

// Academic calendar events
export const mockAcademicCalendar = [
  { id: 'cal-001', type: 'registration', title_ar: 'بداية التسجيل', title_en: 'Registration Opens', start_date: '2026-01-05', end_date: '2026-01-15' },
  { id: 'cal-002', type: 'deadline', title_ar: 'آخر موعد للسحب', title_en: 'Last Day to Drop', start_date: '2026-02-15', end_date: null },
  { id: 'cal-003', type: 'exam', title_ar: 'اختبارات منتصف الفصل', title_en: 'Midterm Exams', start_date: '2026-03-08', end_date: '2026-03-19' },
  { id: 'cal-004', type: 'holiday', title_ar: 'عطلة عيد الفطر', title_en: 'Eid Al-Fitr Holiday', start_date: '2026-03-29', end_date: '2026-04-05' },
  { id: 'cal-005', type: 'deadline', title_ar: 'آخر موعد للانسحاب', title_en: 'Last Day to Withdraw', start_date: '2026-04-15', end_date: null },
  { id: 'cal-006', type: 'exam', title_ar: 'الاختبارات النهائية', title_en: 'Final Exams', start_date: '2026-05-10', end_date: '2026-05-25' },
  { id: 'cal-007', type: 'holiday', title_ar: 'نهاية الفصل الدراسي', title_en: 'End of Semester', start_date: '2026-05-30', end_date: null },
  { id: 'cal-008', type: 'registration', title_ar: 'تسجيل الفصل الصيفي', title_en: 'Summer Registration', start_date: '2026-05-15', end_date: '2026-05-25' },
];

// Available courses for registration
export const mockAvailableCourses = [
  { id: 'sec-101', course_code: 'CS201', name_ar: 'هياكل البيانات', name_en: 'Data Structures', credits: 3, prerequisites: ['CS101'], seats_available: 12, total_seats: 35, instructor_name: 'Dr. Ahmad', schedule: 'Sun/Tue 10:00-11:30' },
  { id: 'sec-102', course_code: 'CS202', name_ar: 'قواعد البيانات', name_en: 'Database Systems', credits: 3, prerequisites: ['CS101'], seats_available: 5, total_seats: 30, instructor_name: 'Dr. Sarah', schedule: 'Mon/Wed 14:00-15:30' },
  { id: 'sec-103', course_code: 'MATH301', name_ar: 'الإحصاء', name_en: 'Statistics', credits: 3, prerequisites: ['MATH201'], seats_available: 20, total_seats: 40, instructor_name: 'Dr. Mohammed', schedule: 'Sun/Tue 12:00-13:30' },
  { id: 'sec-104', course_code: 'ENG201', name_ar: 'الكتابة الأكاديمية', name_en: 'Academic Writing', credits: 3, prerequisites: ['ENG102'], seats_available: 0, total_seats: 25, instructor_name: 'Dr. Lisa', schedule: 'Mon/Wed 10:00-11:30' },
  { id: 'sec-105', course_code: 'CS301', name_ar: 'هندسة البرمجيات', name_en: 'Software Engineering', credits: 3, prerequisites: ['CS201'], seats_available: 18, total_seats: 35, instructor_name: 'Dr. Fahad', schedule: 'Sun/Tue 14:00-15:30' },
  { id: 'sec-106', course_code: 'IS301', name_ar: 'أمن المعلومات', name_en: 'Information Security', credits: 3, prerequisites: ['IS210'], seats_available: 8, total_seats: 30, instructor_name: 'Dr. Khaled', schedule: 'Mon/Wed 12:00-13:30' },
  { id: 'sec-107', course_code: 'CS303', name_ar: 'الذكاء الاصطناعي', name_en: 'Artificial Intelligence', credits: 3, prerequisites: ['CS201', 'MATH301'], seats_available: 15, total_seats: 30, instructor_name: 'Dr. Ali', schedule: 'Tue/Thu 10:00-11:30' },
  { id: 'sec-108', course_code: 'GEN101', name_ar: 'مهارات التواصل', name_en: 'Communication Skills', credits: 2, prerequisites: [], seats_available: 25, total_seats: 50, instructor_name: 'Dr. Nadia', schedule: 'Wed 16:00-18:00' },
];

// Payment history
export const mockPaymentHistory = [
  { id: 'pay-001', amount: 500, currency: 'KWD', status: 'completed', method: 'knet', description_ar: 'دفعة رسوم دراسية', description_en: 'Tuition payment', created_at: '2026-02-10T10:00:00Z' },
  { id: 'pay-002', amount: 250, currency: 'KWD', status: 'completed', method: 'knet', description_ar: 'دفعة رسوم دراسية', description_en: 'Tuition payment', created_at: '2026-01-15T09:00:00Z' },
  { id: 'pay-003', amount: 150, currency: 'KWD', status: 'completed', method: 'apple_pay', description_ar: 'رسوم المختبر', description_en: 'Lab fee', created_at: '2025-12-20T11:00:00Z' },
  { id: 'pay-004', amount: 100, currency: 'KWD', status: 'completed', method: 'visa', description_ar: 'رسوم التسجيل', description_en: 'Registration fee', created_at: '2025-12-05T14:00:00Z' },
  { id: 'pay-005', amount: 500, currency: 'KWD', status: 'failed', method: 'knet', description_ar: 'دفعة فشلت', description_en: 'Failed payment', created_at: '2025-11-28T16:00:00Z' },
];

// Installment plans
export const mockInstallmentPlan = {
  plan_name_ar: 'خطة تقسيط الرسوم الدراسية',
  plan_name_en: 'Tuition Installment Plan',
  total_amount: 1250,
  currency: 'KWD',
  installments: [
    { id: 'inst-001', amount: 500, due_date: '2026-01-15', status: 'paid', paid_date: '2026-01-10' },
    { id: 'inst-002', amount: 500, due_date: '2026-03-15', status: 'paid', paid_date: '2026-03-12' },
    { id: 'inst-003', amount: 250, due_date: '2026-05-15', status: 'upcoming', paid_date: null },
  ],
};

// Campus buildings
export const mockBuildings = [
  { id: 'bld-001', name_ar: 'مبنى العلوم', name_en: 'Science Building', lat: 29.2766, lng: 47.9906, floors: 4, rooms: ['S101', 'S102', 'S201', 'S301'], category: 'academic' },
  { id: 'bld-002', name_ar: 'مبنى الهندسة', name_en: 'Engineering Building', lat: 29.2770, lng: 47.9910, floors: 3, rooms: ['E101', 'E201', 'E301'], category: 'academic' },
  { id: 'bld-003', name_ar: 'مبنى الإدارة', name_en: 'Administration Building', lat: 29.2760, lng: 47.9900, floors: 2, rooms: ['A101', 'A201'], category: 'services' },
  { id: 'bld-004', name_ar: 'المكتبة', name_en: 'Library', lat: 29.2772, lng: 47.9902, floors: 3, rooms: ['L1', 'L2', 'L3'], category: 'library' },
  { id: 'bld-005', name_ar: 'مركز الطلاب', name_en: 'Student Center', lat: 29.2768, lng: 47.9908, floors: 2, rooms: ['SC1', 'SC2'], category: 'social' },
  { id: 'bld-006', name_ar: 'المسجد', name_en: 'Mosque', lat: 29.2764, lng: 47.9912, floors: 1, rooms: [], category: 'religious' },
];

// Campus news
export const mockNews = [
  { id: 'news-001', title_ar: 'الجامعة تحتل المركز الأول في تصنيف التميز', title_en: 'University Ranks #1 in Excellence Ranking', excerpt_ar: 'حصلت جامعة الخليج على المركز الأول...', excerpt_en: 'Gulf University has been ranked #1...', department: 'PR', date: '2026-04-07', image_url: null },
  { id: 'news-002', title_ar: 'افتتاح مختبر الذكاء الاصطناعي الجديد', title_en: 'New AI Lab Opening', excerpt_ar: 'يسر الجامعة الإعلان عن افتتاح مختبر...', excerpt_en: 'The university is pleased to announce...', department: 'CS', date: '2026-04-05', image_url: null },
  { id: 'news-003', title_ar: 'تمديد موعد التسجيل للفصل الصيفي', title_en: 'Summer Registration Extended', excerpt_ar: 'تم تمديد موعد التسجيل حتى...', excerpt_en: 'Registration deadline extended to...', department: 'Registrar', date: '2026-04-03', image_url: null },
  { id: 'news-004', title_ar: 'حفل تكريم الطلاب المتفوقين', title_en: 'Honor Students Ceremony', excerpt_ar: 'ندعو جميع الطلاب المتفوقين لحضور...', excerpt_en: 'All honor students are invited to attend...', department: 'Student Affairs', date: '2026-04-01', image_url: null },
  { id: 'news-005', title_ar: 'بدء التقديم على المنح الدراسية', title_en: 'Scholarship Applications Open', excerpt_ar: 'يمكنكم الآن التقديم على المنح...', excerpt_en: 'Scholarship applications are now open...', department: 'Financial Aid', date: '2026-03-28', image_url: null },
];

// Dining venues
export const mockDining = [
  { id: 'din-001', name_ar: 'كافتيريا الحرم', name_en: 'Campus Cafeteria', hours: '07:00 - 20:00', is_open: true, menu_items: [{ name_ar: 'مشاوي', name_en: 'Grills', price: 2.5 }, { name_ar: 'سلطة', name_en: 'Salad', price: 1.5 }, { name_ar: 'عصير', name_en: 'Juice', price: 0.75 }] },
  { id: 'din-002', name_ar: 'مقهى المكتبة', name_en: 'Library Cafe', hours: '08:00 - 18:00', is_open: true, menu_items: [{ name_ar: 'قهوة', name_en: 'Coffee', price: 1.0 }, { name_ar: 'كيك', name_en: 'Cake', price: 1.25 }] },
  { id: 'din-003', name_ar: 'مطعم الطلاب', name_en: 'Student Restaurant', hours: '11:00 - 15:00', is_open: false, menu_items: [{ name_ar: 'مجبوس', name_en: 'Machboos', price: 3.0 }, { name_ar: 'بريان', name_en: 'Biryani', price: 2.75 }] },
];

// Lost and found
export const mockLostFound = [
  { id: 'lf-001', description_ar: 'محفظة سوداء', description_en: 'Black wallet', location_ar: 'مبنى العلوم - الطابق الثاني', location_en: 'Science Building - 2nd Floor', date: '2026-04-07', status: 'found', contact: 'Student Affairs' },
  { id: 'lf-002', description_ar: 'سماعات أبل', description_en: 'AirPods', location_ar: 'المكتبة', location_en: 'Library', date: '2026-04-05', status: 'found', contact: 'Library Desk' },
  { id: 'lf-003', description_ar: 'مفاتيح سيارة', description_en: 'Car keys', location_ar: 'موقف السيارات', location_en: 'Parking Lot', date: '2026-04-03', status: 'claimed', contact: null },
  { id: 'lf-004', description_ar: 'كتاب رياضيات', description_en: 'Math textbook', location_ar: 'قاعة المحاضرات A', location_en: 'Lecture Hall A', date: '2026-03-25', status: 'expired', contact: null },
];

// Social - Study groups
export const mockStudyGroups = [
  { id: 'sg-001', course_code: 'CS101', name_ar: 'مجموعة دراسة البرمجة', name_en: 'Programming Study Group', member_count: 8, next_meeting: '2026-04-10T16:00:00Z', location: 'Library Room L2' },
  { id: 'sg-002', course_code: 'MATH201', name_ar: 'مجموعة دراسة الرياضيات', name_en: 'Math Study Group', member_count: 5, next_meeting: '2026-04-11T14:00:00Z', location: 'Student Center SC1' },
  { id: 'sg-003', course_code: 'ENG102', name_ar: 'مجموعة دراسة اللغة الإنجليزية', name_en: 'English Study Group', member_count: 6, next_meeting: '2026-04-12T10:00:00Z', location: 'Library Room L3' },
];

// Social - Peer mentoring
export const mockMentoring = [
  { id: 'mentor-001', name_ar: 'أحمد العلي', name_en: 'Ahmed Al-Ali', major_ar: 'علوم الحاسب', major_en: 'Computer Science', year: 4, gpa: 3.8, bio_ar: 'أحب مساعدة الطلاب الجدد', bio_en: 'I love helping new students', topics: ['programming', 'algorithms'] },
  { id: 'mentor-002', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani', major_ar: 'هندسة', major_en: 'Engineering', year: 3, gpa: 3.65, bio_ar: 'متخصصة في الهندسة الكهربائية', bio_en: 'Specialized in electrical engineering', topics: ['circuits', 'math'] },
  { id: 'mentor-003', name_ar: 'عبدالله القحطاني', name_en: 'Abdullah Al-Qahtani', major_ar: 'إدارة أعمال', major_en: 'Business', year: 4, gpa: 3.55, bio_ar: 'خبرة في ريادة الأعمال', bio_en: 'Experienced in entrepreneurship', topics: ['business', 'startups'] },
];

// Social - Anonymous Q&A
export const mockAnonymousQA = [
  { id: 'qa-001', question_ar: 'هل يمكن سحب مادة بعد منتصف الفصل؟', question_en: 'Can I drop a course after midterms?', answer_ar: 'نعم، لكن ستظهر بدرجة W في السجل الأكاديمي', answer_en: 'Yes, but it will show as W on your transcript', upvotes: 24, created_at: '2026-04-06' },
  { id: 'qa-002', question_ar: 'كيف أقدم على منحة دراسية؟', question_en: 'How do I apply for a scholarship?', answer_ar: 'تواصل مع مكتب المساعدات المالية في مبنى الإدارة', answer_en: 'Contact the Financial Aid office in the Administration Building', upvotes: 18, created_at: '2026-04-05' },
  { id: 'qa-003', question_ar: 'هل فيه خدمة إرشاد نفسي بالجامعة؟', question_en: 'Is there counseling service at the university?', answer_ar: 'نعم، مركز الإرشاد الطلابي مفتوح يومياً من ٨ صباحاً حتى ٤ عصراً', answer_en: 'Yes, the Student Counseling Center is open daily 8 AM - 4 PM', upvotes: 31, created_at: '2026-04-03' },
  { id: 'qa-004', question_ar: 'ما هي أسهل مادة اختيارية؟', question_en: 'What is the easiest elective?', answer_ar: 'يختلف حسب تخصصك، لكن GEN101 مهارات التواصل شائعة', answer_en: 'It depends on your major, but GEN101 Communication Skills is popular', upvotes: 42, created_at: '2026-04-01' },
  { id: 'qa-005', question_ar: 'هل يمكنني تأجيل الامتحان النهائي؟', question_en: 'Can I defer my final exam?', answer_ar: 'فقط بعذر طبي موثق، قدم الطلب قبل أسبوع من الامتحان', answer_en: 'Only with documented medical excuse, submit request 1 week before exam', upvotes: 15, created_at: '2026-03-28' },
];

// Financial aid
export const mockFinancialAid = [
  { id: 'aid-001', name_ar: 'منحة التفوق الأكاديمي', name_en: 'Academic Excellence Scholarship', amount: 2000, currency: 'KWD', status: 'active', semester: 'Spring 2026', requirements_met: true },
  { id: 'aid-002', name_ar: 'منحة الحاجة المالية', name_en: 'Financial Need Grant', amount: 1000, currency: 'KWD', status: 'pending_documents', semester: 'Spring 2026', requirements_met: false, missing_documents: ['Income proof', 'ID copy'] },
];

// Refund tracking
export const mockRefunds = [
  { id: 'ref-001', amount: 100, currency: 'KWD', reason_ar: 'انسحاب من مادة', reason_en: 'Course withdrawal', status: 'processing', initiated_at: '2026-04-01', estimated_completion: '2026-04-10' },
];

// Transcript requests
export const mockTranscriptRequests = [
  { id: 'tr-001', type: 'official', copies: 2, status: 'ready', requested_at: '2026-03-20', completed_at: '2026-03-25', delivery: 'pickup' },
  { id: 'tr-002', type: 'unofficial', copies: 1, status: 'processing', requested_at: '2026-04-05', completed_at: null, delivery: 'email' },
];

// Social - Conversation messages
export const mockConversationMessages = [
  { id: 'msg-001', sender_id: studentId, content: 'مرحبا! هل عندك ملخص الفصل الخامس؟', created_at: '2026-04-07T10:00:00Z' },
  { id: 'msg-002', sender_id: 'other-001', content: 'أهلاً! نعم عندي، أرسله لك الحين', created_at: '2026-04-07T10:05:00Z' },
  { id: 'msg-003', sender_id: studentId, content: 'شكراً! 🙏', created_at: '2026-04-07T10:06:00Z' },
  { id: 'msg-004', sender_id: 'other-001', content: 'تفضلي الملخص. بالتوفيق في الامتحان!', created_at: '2026-04-07T10:10:00Z' },
  { id: 'msg-005', sender_id: studentId, content: 'الله يعطيك العافية! هل تبين ندرس سوا بكرة؟', created_at: '2026-04-07T10:15:00Z' },
  { id: 'msg-006', sender_id: 'other-001', content: 'زين، الساعة ٤ بالمكتبة؟', created_at: '2026-04-07T10:20:00Z' },
];
