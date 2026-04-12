// Client-side mock data so the app works without a backend
// Mirrors the backend mock-data.ts structure

const studentId = '770e8400-e29b-41d4-a716-446655440002';

export const mockResponses: Record<string, any> = {
  '/api/v1/students/me': {
    success: true,
    data: {
      student: {
        id: studentId,
        name_ar: 'نورة الصباح',
        name_en: 'Noura Al-Sabah',
        email: 'noura@gust.edu.kw',
        major_name_ar: 'علوم الحاسب',
        major_name_en: 'Computer Science',
        gpa_cumulative: 3.45,
        student_number: '202401001',
        cohort_year: 2024,
      },
      current_term: { name_ar: 'الفصل الدراسي الثاني ٢٠٢٥-٢٠٢٦', name_en: 'Spring Semester 2025-2026' },
      today_classes_count: 2,
      upcoming_deadlines_count: 3,
      balance_due: 500,
      currency: 'KWD',
    },
  },

  '/api/v1/students/me/schedule': {
    success: true,
    data: [
      {
        enrollment_id: 'enr-001', course_code: 'CS101',
        course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science',
        credit_hours: 3,
        schedule_slots: [
          { day: 'sunday', start_time: '08:00', end_time: '09:30', room: 'B-201' },
          { day: 'tuesday', start_time: '08:00', end_time: '09:30', room: 'B-201' },
        ],
        room: 'B-201',
        instructor_name_ar: 'د. أحمد المطيري', instructor_name_en: 'Dr. Ahmed Al-Mutairi',
      },
      {
        enrollment_id: 'enr-002', course_code: 'MATH201',
        course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics',
        credit_hours: 3,
        schedule_slots: [
          { day: 'sunday', start_time: '10:00', end_time: '11:30', room: 'A-105' },
          { day: 'tuesday', start_time: '10:00', end_time: '11:30', room: 'A-105' },
        ],
        room: 'A-105',
        instructor_name_ar: 'د. فاطمة الراشد', instructor_name_en: 'Dr. Fatima Al-Rashid',
      },
      {
        enrollment_id: 'enr-003', course_code: 'ENG102',
        course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English',
        credit_hours: 3,
        schedule_slots: [
          { day: 'monday', start_time: '13:00', end_time: '14:30', room: 'C-301' },
          { day: 'wednesday', start_time: '13:00', end_time: '14:30', room: 'C-301' },
        ],
        room: 'C-301',
        instructor_name_ar: 'أ. سارة العنزي', instructor_name_en: 'Ms. Sara Al-Enezi',
      },
      {
        enrollment_id: 'enr-004', course_code: 'IS210',
        course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems',
        credit_hours: 3,
        schedule_slots: [
          { day: 'monday', start_time: '08:00', end_time: '09:30', room: 'D-102' },
          { day: 'wednesday', start_time: '08:00', end_time: '09:30', room: 'D-102' },
        ],
        room: 'D-102',
        instructor_name_ar: 'د. محمد الشمري', instructor_name_en: 'Dr. Mohammed Al-Shammari',
      },
    ],
  },

  '/api/v1/students/me/grades': {
    success: true,
    data: {
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
        { enrollment_id: 'enr-001', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', credit_hours: 3, grade: 'A-', grade_points: 3.7 },
        { enrollment_id: 'enr-002', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', credit_hours: 3, grade: 'B+', grade_points: 3.3 },
        { enrollment_id: 'enr-003', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', credit_hours: 3, grade: null, grade_points: null },
        { enrollment_id: 'enr-004', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', credit_hours: 3, grade: null, grade_points: null },
      ],
    },
  },

  '/api/v1/students/me/grades/enr-001': {
    success: true,
    data: {
      enrollment_id: 'enr-001',
      course_code: 'CS101',
      course_name_ar: 'مقدمة في علوم الحاسب',
      course_name_en: 'Introduction to Computer Science',
      grade: 'A-',
      grade_points: 3.7,
      components: [
        { name_ar: 'واجبات', name_en: 'Homework', weight: 20, score: 18, max_score: 20, class_average: 15.5 },
        { name_ar: 'اختبار منتصف الفصل', name_en: 'Midterm Exam', weight: 25, score: 22, max_score: 25, class_average: 18.2 },
        { name_ar: 'مشروع', name_en: 'Project', weight: 20, score: 17, max_score: 20, class_average: 16.0 },
        { name_ar: 'اختبار نهائي', name_en: 'Final Exam', weight: 35, score: 30, max_score: 35, class_average: 25.5 },
      ],
    },
  },

  '/api/v1/students/me/attendance': {
    success: true,
    data: [
      { enrollment_id: 'enr-001', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', total_sessions: 8, present: 6, absent: 1, excused: 1, late: 0, attendance_percentage: 75, warning: false },
      { enrollment_id: 'enr-002', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', total_sessions: 8, present: 7, absent: 0, excused: 1, late: 0, attendance_percentage: 87.5, warning: false },
      { enrollment_id: 'enr-003', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', total_sessions: 8, present: 5, absent: 2, excused: 1, late: 0, attendance_percentage: 62.5, warning: true },
      { enrollment_id: 'enr-004', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', total_sessions: 8, present: 8, absent: 0, excused: 0, late: 0, attendance_percentage: 100, warning: false },
    ],
  },

  '/api/v1/students/me/assignments': {
    success: true,
    data: [
      { id: 'asg-001', title_ar: 'واجب البرمجة الأول', title_en: 'Programming Assignment 1', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', due_date: '2026-04-12T23:59:00Z', max_score: 20, type: 'homework' },
      { id: 'asg-002', title_ar: 'اختبار قصير - الأسبوع ٨', title_en: 'Quiz - Week 8', course_code: 'CS101', course_name_ar: 'مقدمة في علوم الحاسب', course_name_en: 'Introduction to Computer Science', due_date: '2026-04-15T23:59:00Z', max_score: 10, type: 'quiz' },
      { id: 'asg-003', title_ar: 'حل مسائل التكامل', title_en: 'Integration Problem Set', course_code: 'MATH201', course_name_ar: 'الرياضيات التطبيقية', course_name_en: 'Applied Mathematics', due_date: '2026-04-18T23:59:00Z', max_score: 15, type: 'homework' },
      { id: 'asg-004', title_ar: 'مقال أكاديمي', title_en: 'Academic Essay', course_code: 'ENG102', course_name_ar: 'اللغة الإنجليزية الأكاديمية', course_name_en: 'Academic English', due_date: '2026-04-20T23:59:00Z', max_score: 25, type: 'project' },
      { id: 'asg-005', title_ar: 'مشروع قاعدة البيانات', title_en: 'Database Project', course_code: 'IS210', course_name_ar: 'نظم المعلومات الإدارية', course_name_en: 'Management Information Systems', due_date: '2026-04-25T23:59:00Z', max_score: 30, type: 'project' },
    ],
  },

  '/api/v1/students/me/fees': {
    success: true,
    data: {
      balance_due: 500,
      currency: 'KWD',
      next_due_date: '2026-04-30',
      fees: [
        { id: 'fee-001', type: 'tuition', description_ar: 'الرسوم الدراسية', description_en: 'Tuition Fee', amount: '1000', due_date: '2026-02-15', paid_amount: '500', currency: 'KWD' },
        { id: 'fee-002', type: 'lab', description_ar: 'رسوم المختبر', description_en: 'Lab Fee', amount: '150', due_date: '2026-02-15', paid_amount: '150', currency: 'KWD' },
        { id: 'fee-003', type: 'registration', description_ar: 'رسوم التسجيل', description_en: 'Registration Fee', amount: '100', due_date: '2026-02-01', paid_amount: '100', currency: 'KWD' },
      ],
      recent_payments: [
        { id: 'pay-001', amount: '500', currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-02-10T10:00:00Z' },
        { id: 'pay-002', amount: '250', currency: 'KWD', status: 'completed', method: 'knet', created_at: '2026-01-15T09:00:00Z' },
      ],
    },
  },

  '/api/v1/students/me/degree-audit': {
    success: true,
    data: {
      total_credits_required: 136, credits_completed: 45, credits_in_progress: 12, credits_remaining: 79, completion_percentage: 33,
      courses: [
        { code: 'CS101', name_ar: 'مقدمة في علوم الحاسب', name_en: 'Introduction to Computer Science', credits: 3, status: 'completed', grade: 'A-' },
        { code: 'MATH201', name_ar: 'الرياضيات التطبيقية', name_en: 'Applied Mathematics', credits: 3, status: 'completed', grade: 'B+' },
        { code: 'ENG102', name_ar: 'اللغة الإنجليزية الأكاديمية', name_en: 'Academic English', credits: 3, status: 'in_progress', grade: null },
        { code: 'IS210', name_ar: 'نظم المعلومات الإدارية', name_en: 'Management Information Systems', credits: 3, status: 'in_progress', grade: null },
      ],
    },
  },

  '/api/v1/students/me/calendar': {
    success: true,
    data: [
      { id: 'cal-001', type: 'registration', title_ar: 'بداية التسجيل', title_en: 'Registration Opens', start_date: '2026-01-05', end_date: '2026-01-15' },
      { id: 'cal-002', type: 'deadline', title_ar: 'آخر موعد للسحب', title_en: 'Last Day to Drop', start_date: '2026-02-15', end_date: null },
      { id: 'cal-003', type: 'exam', title_ar: 'اختبارات منتصف الفصل', title_en: 'Midterm Exams', start_date: '2026-03-08', end_date: '2026-03-19' },
      { id: 'cal-004', type: 'holiday', title_ar: 'عطلة عيد الفطر', title_en: 'Eid Al-Fitr Holiday', start_date: '2026-03-29', end_date: '2026-04-05' },
      { id: 'cal-005', type: 'deadline', title_ar: 'آخر موعد للانسحاب', title_en: 'Last Day to Withdraw', start_date: '2026-04-15', end_date: null },
      { id: 'cal-006', type: 'exam', title_ar: 'الاختبارات النهائية', title_en: 'Final Exams', start_date: '2026-05-10', end_date: '2026-05-25' },
      { id: 'cal-007', type: 'holiday', title_ar: 'نهاية الفصل الدراسي', title_en: 'End of Semester', start_date: '2026-05-30', end_date: null },
      { id: 'cal-008', type: 'registration', title_ar: 'تسجيل الفصل الصيفي', title_en: 'Summer Registration', start_date: '2026-05-15', end_date: '2026-05-25' },
    ],
  },

  '/api/v1/students/me/available-courses': {
    success: true,
    data: [
      { id: 'sec-101', course_code: 'CS201', name_ar: 'هياكل البيانات', name_en: 'Data Structures', credits: 3, prerequisites: ['CS101'], seats_available: 12, total_seats: 35, schedule: 'Sun/Tue 10:00-11:30' },
      { id: 'sec-102', course_code: 'CS202', name_ar: 'قواعد البيانات', name_en: 'Database Systems', credits: 3, prerequisites: ['CS101'], seats_available: 5, total_seats: 30, schedule: 'Mon/Wed 14:00-15:30' },
      { id: 'sec-103', course_code: 'MATH301', name_ar: 'الإحصاء', name_en: 'Statistics', credits: 3, prerequisites: ['MATH201'], seats_available: 20, total_seats: 40, schedule: 'Sun/Tue 12:00-13:30' },
      { id: 'sec-104', course_code: 'ENG201', name_ar: 'الكتابة الأكاديمية', name_en: 'Academic Writing', credits: 3, prerequisites: ['ENG102'], seats_available: 0, total_seats: 25, schedule: 'Mon/Wed 10:00-11:30' },
      { id: 'sec-105', course_code: 'CS301', name_ar: 'هندسة البرمجيات', name_en: 'Software Engineering', credits: 3, prerequisites: ['CS201'], seats_available: 18, total_seats: 35, schedule: 'Sun/Tue 14:00-15:30' },
    ],
  },

  '/api/v1/events': {
    success: true,
    data: [
      { id: 'evt-001', title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي', title_en: 'Workshop: Intro to AI', description_ar: 'تعرف على أساسيات الذكاء الاصطناعي', description_en: 'Learn AI fundamentals', start_time: '2026-04-12T14:00:00Z', end_time: '2026-04-12T16:00:00Z', location_ar: 'قاعة المؤتمرات الرئيسية', location_en: 'Main Conference Hall', category: 'workshop', capacity: 80, rsvp_count: 23, is_rsvped: false },
      { id: 'evt-002', title_ar: 'معرض المشاريع الطلابية', title_en: 'Student Projects Exhibition', description_ar: 'عرض مشاريع التخرج', description_en: 'Graduation projects showcase', start_time: '2026-04-15T10:00:00Z', end_time: '2026-04-15T15:00:00Z', location_ar: 'ساحة الجامعة', location_en: 'University Plaza', category: 'exhibition', capacity: 200, rsvp_count: 87, is_rsvped: false },
      { id: 'evt-003', title_ar: 'محاضرة: ريادة الأعمال في الكويت', title_en: 'Lecture: Entrepreneurship in Kuwait', description_ar: 'محاضرة من رائد أعمال كويتي ناجح', description_en: 'Lecture by a successful Kuwaiti entrepreneur', start_time: '2026-04-18T18:00:00Z', end_time: '2026-04-18T20:00:00Z', location_ar: 'القاعة الكبرى', location_en: 'Grand Hall', category: 'lecture', capacity: 150, rsvp_count: 45, is_rsvped: false },
    ],
  },

  '/api/v1/clubs': {
    success: true,
    data: [
      { id: 'club-001', name_ar: 'نادي البرمجة', name_en: 'Coding Club', description_ar: 'نادي لمحبي البرمجة وتطوير البرمجيات', description_en: 'A club for coding enthusiasts', category: 'technology', member_count: 45, status: 'active', is_member: false },
      { id: 'club-002', name_ar: 'نادي ريادة الأعمال', name_en: 'Entrepreneurship Club', description_ar: 'دعم رواد الأعمال الشباب', description_en: 'Supporting young entrepreneurs', category: 'business', member_count: 32, status: 'active', is_member: false },
      { id: 'club-003', name_ar: 'النادي الثقافي', name_en: 'Cultural Club', description_ar: 'فعاليات ثقافية وأدبية متنوعة', description_en: 'Cultural and literary events', category: 'culture', member_count: 58, status: 'active', is_member: true },
    ],
  },

  '/api/v1/events/prayer-times': {
    success: true,
    data: { date: '2026-04-09', hijri_date: '11 شوال 1448', location: 'Kuwait City', times: { fajr: '04:30', sunrise: '05:50', dhuhr: '11:52', asr: '15:18', maghrib: '18:14', isha: '19:37' }, next_prayer: 'asr' },
  },

  '/api/v1/campus/buildings': {
    success: true,
    data: [
      { id: 'bld-001', name_ar: 'مبنى العلوم', name_en: 'Science Building', floors: 4, rooms: ['S101', 'S102', 'S201', 'S301'], category: 'academic' },
      { id: 'bld-002', name_ar: 'مبنى الهندسة', name_en: 'Engineering Building', floors: 3, rooms: ['E101', 'E201', 'E301'], category: 'academic' },
      { id: 'bld-003', name_ar: 'مبنى الإدارة', name_en: 'Administration Building', floors: 2, rooms: ['A101', 'A201'], category: 'services' },
      { id: 'bld-004', name_ar: 'المكتبة', name_en: 'Library', floors: 3, rooms: ['L1', 'L2', 'L3'], category: 'library' },
      { id: 'bld-005', name_ar: 'مركز الطلاب', name_en: 'Student Center', floors: 2, rooms: ['SC1', 'SC2'], category: 'social' },
      { id: 'bld-006', name_ar: 'المسجد', name_en: 'Mosque', floors: 1, rooms: [], category: 'religious' },
    ],
  },

  '/api/v1/campus/news': {
    success: true,
    data: [
      { id: 'news-001', title_ar: 'الجامعة تحتل المركز الأول في تصنيف التميز', title_en: 'University Ranks #1 in Excellence Ranking', excerpt_ar: 'حصلت جامعة الخليج على المركز الأول...', excerpt_en: 'Gulf University has been ranked #1...', department: 'PR', date: '2026-04-07' },
      { id: 'news-002', title_ar: 'افتتاح مختبر الذكاء الاصطناعي الجديد', title_en: 'New AI Lab Opening', excerpt_ar: 'يسر الجامعة الإعلان عن افتتاح مختبر...', excerpt_en: 'The university is pleased to announce...', department: 'CS', date: '2026-04-05' },
      { id: 'news-003', title_ar: 'تمديد موعد التسجيل للفصل الصيفي', title_en: 'Summer Registration Extended', excerpt_ar: 'تم تمديد موعد التسجيل حتى...', excerpt_en: 'Registration deadline extended to...', department: 'Registrar', date: '2026-04-03' },
    ],
  },

  '/api/v1/campus/dining': {
    success: true,
    data: [
      { id: 'din-001', name_ar: 'كافتيريا الحرم', name_en: 'Campus Cafeteria', hours: '07:00 - 20:00', is_open: true, menu_items: [{ name_ar: 'مشاوي', name_en: 'Grills', price: 2.5 }, { name_ar: 'سلطة', name_en: 'Salad', price: 1.5 }] },
      { id: 'din-002', name_ar: 'مقهى المكتبة', name_en: 'Library Cafe', hours: '08:00 - 18:00', is_open: true, menu_items: [{ name_ar: 'قهوة', name_en: 'Coffee', price: 1.0 }] },
      { id: 'din-003', name_ar: 'مطعم الطلاب', name_en: 'Student Restaurant', hours: '11:00 - 15:00', is_open: false, menu_items: [{ name_ar: 'مجبوس', name_en: 'Machboos', price: 3.0 }] },
    ],
  },

  '/api/v1/campus/lost-found': {
    success: true,
    data: [
      { id: 'lf-001', description_ar: 'محفظة سوداء', description_en: 'Black wallet', location_ar: 'مبنى العلوم - الطابق الثاني', location_en: 'Science Building - 2nd Floor', date: '2026-04-07', status: 'found', contact: 'Student Affairs' },
      { id: 'lf-002', description_ar: 'سماعات أبل', description_en: 'AirPods', location_ar: 'المكتبة', location_en: 'Library', date: '2026-04-05', status: 'found', contact: 'Library Desk' },
    ],
  },

  '/api/v1/feed': {
    success: true,
    data: [
      { id: 'post_001', author: { id: 'user_201', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani' }, content_ar: 'هل أحد حضر محاضرة الذكاء الاصطناعي اليوم؟ كانت رائعة! 🧠', content_en: 'Did anyone attend the AI lecture today? Amazing! 🧠', type: 'text', likes_count: 24, comments_count: 7, created_at: '2026-04-08T09:30:00Z' },
      { id: 'post_002', author: { id: 'user_302', name_ar: 'عبدالله القحطاني', name_en: 'Abdullah Al-Qahtani' }, content_ar: 'تذكير: آخر موعد لتسليم مشروع هندسة البرمجيات يوم الخميس 📝', content_en: 'Reminder: Software Engineering project deadline is Thursday 📝', type: 'text', likes_count: 15, comments_count: 12, created_at: '2026-04-08T08:15:00Z' },
      { id: 'post_003', author: { id: 'club_cs', name_ar: 'نادي علوم الحاسب', name_en: 'CS Club' }, content_ar: 'يسرنا دعوتكم لحضور هاكاثون الابتكار يوم السبت القادم 🏆', content_en: 'Join us for the Innovation Hackathon next Saturday 🏆', type: 'event', likes_count: 52, comments_count: 18, created_at: '2026-04-07T16:00:00Z' },
    ],
  },

  '/api/v1/messages': {
    success: true,
    data: [
      { conversation_id: 'conv_001', participant: { id: 'user_201', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani' }, last_message: { content_ar: 'تمام، نتقابل في المكتبة الساعة ٤', content_en: "OK, let's meet at the library at 4", sent_at: '2026-04-08T10:30:00Z', is_read: false }, unread_count: 2 },
      { conversation_id: 'conv_002', participant: { id: 'user_302', name_ar: 'عبدالله القحطاني', name_en: 'Abdullah Al-Qahtani' }, last_message: { content_ar: 'شكراً على الملاحظات', content_en: 'Thanks for the notes', sent_at: '2026-04-08T09:15:00Z', is_read: true }, unread_count: 0 },
    ],
  },

  '/api/v1/messages/conv_001': {
    success: true,
    data: [
      { id: 'msg-001', sender_id: 'user_201', content_ar: 'مرحباً! هل تبين نذاكر سوا للامتحان؟', content_en: 'Hey! Want to study together for the exam?', sent_at: '2026-04-08T09:00:00Z' },
      { id: 'msg-002', sender_id: 'me', content_ar: 'أكيد! وين نتقابل؟', content_en: 'Sure! Where should we meet?', sent_at: '2026-04-08T09:15:00Z' },
      { id: 'msg-003', sender_id: 'user_201', content_ar: 'تمام، نتقابل في المكتبة الساعة ٤', content_en: "OK, let's meet at the library at 4", sent_at: '2026-04-08T10:30:00Z' },
    ],
  },

  '/api/v1/feed/study-groups': {
    success: true,
    data: [
      { id: 'sg-001', course_code: 'CS101', name_ar: 'مجموعة دراسة البرمجة', name_en: 'Programming Study Group', member_count: 8, next_meeting: '2026-04-10T16:00:00Z', location: 'Library Room L2', is_member: false },
      { id: 'sg-002', course_code: 'MATH201', name_ar: 'مجموعة دراسة الرياضيات', name_en: 'Math Study Group', member_count: 5, next_meeting: '2026-04-11T14:00:00Z', location: 'Student Center SC1', is_member: false },
    ],
  },

  '/api/v1/feed/mentoring': {
    success: true,
    data: [
      { id: 'mentor-001', name_ar: 'أحمد العلي', name_en: 'Ahmed Al-Ali', major_ar: 'علوم الحاسب', major_en: 'Computer Science', year: 4, gpa: 3.8, bio_ar: 'أحب مساعدة الطلاب الجدد', bio_en: 'I love helping new students', topics: ['programming', 'algorithms'] },
      { id: 'mentor-002', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani', major_ar: 'هندسة', major_en: 'Engineering', year: 3, gpa: 3.65, bio_ar: 'متخصصة في الهندسة الكهربائية', bio_en: 'Specialized in electrical engineering', topics: ['circuits', 'math'] },
    ],
  },

  '/api/v1/feed/anonymous-qa': {
    success: true,
    data: [
      { id: 'qa-001', question_ar: 'هل يمكن سحب مادة بعد منتصف الفصل؟', question_en: 'Can I drop a course after midterms?', answer_ar: 'نعم، لكن ستظهر بدرجة W', answer_en: 'Yes, but it will show as W on your transcript', upvotes: 24, created_at: '2026-04-06' },
      { id: 'qa-002', question_ar: 'كيف أقدم على منحة دراسية؟', question_en: 'How do I apply for a scholarship?', answer_ar: 'تواصل مع مكتب المساعدات المالية', answer_en: 'Contact the Financial Aid office', upvotes: 18, created_at: '2026-04-05' },
    ],
  },

  '/api/v1/ai/chat': {
    success: true,
    data: {
      conversation_id: 'mock-conv-local',
      message: {
        role: 'assistant',
        content: 'أهلاً! بناءً على سؤالك، هذي المعلومات اللي عندي:\n\nعندك ٤ مواد هالفصل بإجمالي ١٢ ساعة. معدلك التراكمي ٣.٤٥ وأداؤك ممتاز.',
        timestamp: new Date().toISOString(),
        sources: [{ document_title: 'دليل السياسات الأكاديمية', section: 'القسم ٤.٢ - نظام الدرجات', url: null }],
      },
      suggested_prompts: [],
      confidence_score: 88,
      model_tier: 'standard',
      detected_language: 'ar',
      can_escalate: false,
    },
  },

  '/api/v1/ai/escalate': {
    success: true,
    data: {
      ticket_id: 'esc-mock-001',
      status: 'queued',
      estimated_wait_ar: 'خلال ٢٤ ساعة',
      estimated_wait_en: 'Within 24 hours',
      message_ar: 'تم تحويل محادثتك لمستشار أكاديمي.',
      message_en: 'Your conversation has been forwarded to an academic advisor.',
    },
  },

  '/api/v1/ai/course-recommendations': {
    success: true,
    data: [
      {
        id: 'rec-001', course_code: 'CS201', name_ar: 'هياكل البيانات', name_en: 'Data Structures', credits: 3,
        reason_ar: 'مطلوبة لتخصصك وحصلت على A- في المتطلب السابق CS101', reason_en: 'Required for your major and you got A- in prerequisite CS101',
        match_score: 95, historical_grade_avg: 'B+', workload_level: 'moderate', schedule: 'Sun/Tue 10:00-11:30', seats_available: 12, total_seats: 35, prerequisites: ['CS101'],
      },
      {
        id: 'rec-002', course_code: 'MATH301', name_ar: 'الإحصاء', name_en: 'Statistics', credits: 3,
        reason_ar: 'مطلوبة للتخرج وتكمل مهارات MATH201', reason_en: 'Required for graduation and builds on MATH201',
        match_score: 88, historical_grade_avg: 'B', workload_level: 'moderate', schedule: 'Sun/Tue 12:00-13:30', seats_available: 20, total_seats: 40, prerequisites: ['MATH201'],
      },
      {
        id: 'rec-003', course_code: 'CS202', name_ar: 'قواعد البيانات', name_en: 'Database Systems', credits: 3,
        reason_ar: 'طلاب بنفس مسارك حققوا نتائج ممتازة', reason_en: 'Students with similar profiles achieved excellent results',
        match_score: 82, historical_grade_avg: 'B+', workload_level: 'heavy', schedule: 'Mon/Wed 14:00-15:30', seats_available: 5, total_seats: 30, prerequisites: ['CS101'],
      },
      {
        id: 'rec-004', course_code: 'GEN105', name_ar: 'مهارات التواصل', name_en: 'Communication Skills', credits: 3,
        reason_ar: 'مادة خفيفة تساعد في موازنة حمل الفصل', reason_en: 'Light course to balance semester workload',
        match_score: 75, historical_grade_avg: 'A-', workload_level: 'light', schedule: 'Mon/Wed 10:00-11:30', seats_available: 22, total_seats: 40, prerequisites: [],
      },
    ],
  },

  '/api/v1/ai/nudges': {
    success: true,
    data: [
      { id: 'nudge-001', type: 'deadline', title_ar: 'تذكير: واجب البرمجة', title_en: 'Reminder: Programming Assignment', body_ar: 'موعد تسليم واجب CS101 بعد ٣ أيام', body_en: 'CS101 assignment due in 3 days', priority: 'high', action: 'open_assignments', created_at: new Date().toISOString() },
      { id: 'nudge-002', type: 'registration', title_ar: 'نافذة التسجيل مفتوحة', title_en: 'Registration Window Open', body_ar: 'تسجيل الفصل الصيفي يبدأ قريباً', body_en: 'Summer registration starts soon', priority: 'medium', action: 'open_registration', created_at: new Date().toISOString() },
      { id: 'nudge-003', type: 'gpa_tip', title_ar: 'نصيحة لتحسين المعدل', title_en: 'GPA Improvement Tip', body_ar: 'التركيز على ENG102 يمكن أن يرفع معدلك', body_en: 'Focusing on ENG102 could raise your GPA by 0.1', priority: 'low', action: 'open_grades', created_at: new Date().toISOString() },
    ],
  },

  '/api/v1/notifications': {
    success: true,
    data: [
      { id: 'notif_001', type: 'payment_reminder', title_ar: 'تذكير بموعد السداد', title_en: 'Payment Due Reminder', body_ar: 'موعد سداد القسط الثاني بعد ٣ أيام', body_en: 'Second installment is due in 3 days', priority: 'high', is_read: false, created_at: '2026-04-08T08:00:00Z' },
      { id: 'notif_002', type: 'grade_update', title_ar: 'تحديث الدرجات', title_en: 'Grade Update', body_ar: 'تم رصد درجة اختبار هندسة البرمجيات', body_en: 'Software Engineering midterm grade posted', priority: 'medium', is_read: false, created_at: '2026-04-07T14:30:00Z' },
    ],
  },

  '/api/v1/notifications/preferences': {
    success: true,
    data: {
      push_enabled: true, email_enabled: true, sms_enabled: false,
      channels: {
        payment_reminders: { push: true, email: true, sms: true },
        grade_updates: { push: true, email: true, sms: false },
        event_reminders: { push: true, email: false, sms: false },
        social_updates: { push: true, email: false, sms: false },
        admin_announcements: { push: true, email: true, sms: false },
      },
      quiet_hours: { enabled: true, start: '22:00', end: '07:00' },
    },
  },

  '/api/v1/payments/history': {
    success: true,
    data: [
      { id: 'pay-001', amount: 500, currency: 'KWD', status: 'completed', method: 'knet', description_ar: 'دفعة رسوم دراسية', description_en: 'Tuition payment', created_at: '2026-02-10T10:00:00Z' },
      { id: 'pay-002', amount: 250, currency: 'KWD', status: 'completed', method: 'knet', description_ar: 'دفعة رسوم دراسية', description_en: 'Tuition payment', created_at: '2026-01-15T09:00:00Z' },
    ],
  },

  '/api/v1/payments/installments': {
    success: true,
    data: {
      plan_name_ar: 'خطة تقسيط الرسوم الدراسية', plan_name_en: 'Tuition Installment Plan', total_amount: 1250, currency: 'KWD',
      installments: [
        { id: 'inst-001', amount: 500, due_date: '2026-01-15', status: 'paid', paid_date: '2026-01-10' },
        { id: 'inst-002', amount: 500, due_date: '2026-03-15', status: 'paid', paid_date: '2026-03-12' },
        { id: 'inst-003', amount: 250, due_date: '2026-05-15', status: 'upcoming', paid_date: null },
      ],
    },
  },

  '/api/v1/payments/financial-aid': {
    success: true,
    data: [
      { id: 'aid-001', name_ar: 'منحة التفوق الأكاديمي', name_en: 'Academic Excellence Scholarship', amount: 2000, currency: 'KWD', status: 'active', semester: 'Spring 2026', requirements_met: true },
      { id: 'aid-002', name_ar: 'منحة الحاجة المالية', name_en: 'Financial Need Grant', amount: 1000, currency: 'KWD', status: 'pending_documents', semester: 'Spring 2026', requirements_met: false, missing_documents: ['Income proof', 'ID copy'] },
    ],
  },

  '/api/v1/payments/refunds': {
    success: true,
    data: [
      { id: 'ref-001', amount: 100, currency: 'KWD', reason_ar: 'انسحاب من مادة', reason_en: 'Course withdrawal', status: 'processing', initiated_at: '2026-04-01', estimated_completion: '2026-04-10' },
    ],
  },

  '/api/v1/files/transcript-requests': {
    success: true,
    data: [
      { id: 'tr-001', type: 'official', copies: 2, status: 'ready', requested_at: '2026-03-20', completed_at: '2026-03-25', delivery: 'pickup' },
      { id: 'tr-002', type: 'unofficial', copies: 1, status: 'processing', requested_at: '2026-04-05', completed_at: null, delivery: 'email' },
    ],
  },
};
