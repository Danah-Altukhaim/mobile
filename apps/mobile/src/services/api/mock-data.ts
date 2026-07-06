// Client-side mock data so the app works without a backend.
//
// Academic responses (student summary, schedule, grades, attendance, fees,
// degree audit, course registration, recommendations, class channels, clubs,
// payment installments) are DERIVED FROM THE REAL CCK CATALOG — see
// mock-academics.ts. The fixtures below are still static placeholders for
// campus / social / notifications / services data we don't have real sources
// for yet.

import { academicMockResponses } from './mock-academics';

const staticResponses: Record<string, any> = {
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

  // Grade-appeal window - appeals only open during the appeal period after
  // results are released (CCK Hub Update 17-06-26). Flip `open` to false to
  // demo the closed state.
  '/api/v1/services/appeals/window': {
    success: true,
    data: {
      open: true,
      opens_at: '2026-06-28',
      closes_at: '2026-07-09',
      term_en: 'Summer 2026',
      term_ar: 'صيف 2026',
    },
  },

  // Advising appointments scheduled for this student by an advisor/admin.
  '/api/v1/students/me/advising-meetings': {
    success: true,
    data: [
      { id: 'adv-001', type: 'gpa_warning', title_ar: 'موعد إنذار المعدل', title_en: 'GPA Warning Appointment', advisor_ar: 'د. أحمد الغامدي', advisor_en: 'Dr. Ahmed Al-Ghamdi', scheduled_at: '2026-04-22T11:00:00Z', location_ar: 'مبنى التسجيل، مكتب 204', location_en: 'Registration Building, Office 204', notes_ar: 'يرجى إحضار الجدول الدراسي الحالي.', notes_en: 'Please bring your current course schedule.', status: 'scheduled' },
    ],
  },

  '/api/v1/events': {
    success: true,
    data: [
      { id: 'evt-001', title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي', title_en: 'Workshop: Intro to AI', description_ar: 'تعرف على أساسيات الذكاء الاصطناعي', description_en: 'Learn AI fundamentals', start_time: '2026-04-12T14:00:00Z', end_time: '2026-04-12T16:00:00Z', location_ar: 'قاعة المؤتمرات الرئيسية', location_en: 'Main Conference Hall', category: 'workshop', capacity: 80, rsvp_count: 23, is_rsvped: false, registration_open: true },
      { id: 'evt-002', title_ar: 'معرض المشاريع الطلابية', title_en: 'Student Projects Exhibition', description_ar: 'عرض مشاريع التخرج', description_en: 'Graduation projects showcase', start_time: '2026-04-15T10:00:00Z', end_time: '2026-04-15T15:00:00Z', location_ar: 'ساحة الجامعة', location_en: 'University Plaza', category: 'exhibition', capacity: 200, rsvp_count: 87, is_rsvped: false, registration_open: false },
      { id: 'evt-003', title_ar: 'محاضرة: ريادة الأعمال في الكويت', title_en: 'Lecture: Entrepreneurship in Kuwait', description_ar: 'محاضرة من رائد أعمال كويتي ناجح', description_en: 'Lecture by a successful Kuwaiti entrepreneur', start_time: '2026-04-18T18:00:00Z', end_time: '2026-04-18T20:00:00Z', location_ar: 'القاعة الكبرى', location_en: 'Grand Hall', category: 'lecture', capacity: 150, rsvp_count: 45, is_rsvped: false, registration_open: true },
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
      { id: 'post_001', author: { id: 'user_201', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani' }, content_ar: 'هل أحد حضر محاضرة الذكاء الاصطناعي اليوم؟ كانت رائعة!', content_en: 'Did anyone attend the AI lecture today? Amazing!', type: 'text', likes_count: 24, comments_count: 7, created_at: '2026-04-08T09:30:00Z' },
      { id: 'post_002', author: { id: 'user_302', name_ar: 'عبدالله القحطاني', name_en: 'Abdullah Al-Qahtani' }, content_ar: 'تذكير: آخر موعد لتسليم مشروع هندسة البرمجيات يوم الخميس', content_en: 'Reminder: Software Engineering project deadline is Thursday', type: 'text', likes_count: 15, comments_count: 12, created_at: '2026-04-08T08:15:00Z' },
      { id: 'post_003', author: { id: 'club_cs', name_ar: 'نادي علوم الحاسوب', name_en: 'Computer Science Club' }, content_ar: 'يسرنا دعوتكم لحضور هاكاثون الابتكار يوم السبت القادم', content_en: 'Join us for the Innovation Hackathon next Saturday', type: 'event', likes_count: 52, comments_count: 18, created_at: '2026-04-07T16:00:00Z' },
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
      { id: 'sg-001', course_code: 'CST8109', name_ar: 'مجموعة دراسة برمجة الشبكات', name_en: 'Network Programming Study Group', member_count: 8, next_meeting: '2026-05-16T16:00:00Z', location: 'Library Room L2', is_member: false },
      { id: 'sg-002', course_code: 'CST8288', name_ar: 'مجموعة دراسة أنماط التصميم', name_en: 'Design Patterns Study Group', member_count: 5, next_meeting: '2026-05-17T14:00:00Z', location: 'Student Center SC1', is_member: false },
    ],
  },

  '/api/v1/feed/mentoring': {
    success: true,
    data: [
      { id: 'mentor-001', name_ar: 'أحمد العلي', name_en: 'Ahmed Al-Ali', major_ar: 'دبلوم برمجة الحاسوب', major_en: 'Diploma of Computer Programming', year: 2, gpa: 3.8, bio_ar: 'أحب مساعدة الطلاب الجدد', bio_en: 'I love helping new students', topics: ['programming', 'algorithms'] },
      { id: 'mentor-002', name_ar: 'فاطمة الزهراني', name_en: 'Fatimah Al-Zahrani', major_ar: 'دبلوم المحاسبة', major_en: 'Diploma of Business - Accounting', year: 2, gpa: 3.65, bio_ar: 'متخصصة في المحاسبة المالية', bio_en: 'Specialized in financial accounting', topics: ['accounting', 'finance'] },
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
        content: 'أهلاً! بناءً على سؤالك، هذي المعلومات اللي عندي:\n\nعندك ٥ مواد هالفصل بإجمالي ٢٠ ساعة. معدلك التراكمي ممتاز وأداؤك جيد.',
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

  '/api/v1/ai/nudges': {
    success: true,
    data: [
      { id: 'nudge-001', type: 'deadline', title_ar: 'تذكير: اختبار قصير', title_en: 'Reminder: Quiz', body_ar: 'اختبار CST8109 القصير بعد يوم واحد', body_en: 'CST8109 quiz due in 1 day', priority: 'high', action: 'open_assignments', created_at: new Date().toISOString() },
      { id: 'nudge-002', type: 'registration', title_ar: 'نافذة التسجيل مفتوحة', title_en: 'Registration Window Open', body_ar: 'تسجيل الفصل الصيفي يبدأ قريباً', body_en: 'Summer registration starts soon', priority: 'medium', action: 'open_registration', created_at: new Date().toISOString() },
      { id: 'nudge-003', type: 'gpa_tip', title_ar: 'نصيحة لتحسين المعدل', title_en: 'GPA Improvement Tip', body_ar: 'التركيز على CST8284 يمكن أن يرفع معدلك', body_en: 'Focusing on CST8284 could raise your GPA', priority: 'low', action: 'open_grades', created_at: new Date().toISOString() },
    ],
  },

  '/api/v1/notifications': {
    success: true,
    data: [
      { id: 'notif_001', type: 'payment_reminder', title_ar: 'تذكير بموعد السداد', title_en: 'Payment Due Reminder', body_ar: 'موعد سداد القسط الثاني بعد ٣ أيام', body_en: 'Second installment is due in 3 days', priority: 'high', is_read: false, created_at: '2026-04-08T08:00:00Z' },
      { id: 'notif_002', type: 'grade_update', title_ar: 'تحديث الدرجات', title_en: 'Grade Update', body_ar: 'تم رصد درجة اختبار منتصف الفصل', body_en: 'Midterm grade posted', priority: 'medium', is_read: false, created_at: '2026-04-07T14:30:00Z' },
      // Academic Warning notification (CCK Hub Update doc). Issued to students
      // on academic probation; the in-app banner/popup is gated on the grades
      // endpoint's academic_standing field.
      { id: 'notif_003', type: 'academic_warning', title_ar: 'إنذار أكاديمي', title_en: 'Academic Warning', body_ar: 'لقد حصلت على إنذار أكاديمي. يرجى مراجعة قسم التسجيل للإرشاد الأكاديمي وتوقيع إشعار الإنذار.', body_en: 'You have received an academic warning. Please visit the Registration department for academic advising and to sign the warning notice.', priority: 'high', is_read: false, created_at: '2026-04-06T09:00:00Z' },
      // Absence (FA) warnings — CCK Hub Feedback v3 FA Screen: a notification is
      // sent to the student at each stage (1st warning → 2nd warning → forced
      // withdrawal). This matches CST8109, where absent hours have reached the
      // first-warning threshold for a 4-credit course.
      { id: 'notif_004', type: 'absence_warning', title_ar: 'إنذار غياب أول', title_en: '1st Absence Warning', body_ar: 'وصلت ساعات غيابك في مقرر CST8109 إلى حد الإنذار الأول. يرجى الانتظام في الحضور لتفادي الإنذار الثاني.', body_en: 'Your absences in CST8109 have reached the 1st-warning threshold. Please attend regularly to avoid a 2nd warning.', priority: 'high', is_read: false, created_at: '2026-04-05T11:00:00Z' },
    ],
  },

  '/api/v1/notifications/preferences': {
    success: true,
    data: {
      push_enabled: true, email_enabled: true, sms_enabled: false,
      channels: {
        payment_reminders: { push: true, email: true, sms: true },
        grade_updates: { push: true, email: true, sms: false },
        absence_warnings: { push: true, email: true, sms: true },
        event_reminders: { push: true, email: false, sms: false },
        social_updates: { push: true, email: false, sms: false },
        admin_announcements: { push: true, email: true, sms: false },
      },
      quiet_hours: { enabled: true, start: '22:00', end: '07:00' },
    },
  },

  '/api/v1/files/transcript-requests': {
    success: true,
    data: [
      { id: 'tr-001', type: 'official', copies: 2, status: 'ready', requested_at: '2026-03-20', completed_at: '2026-03-25', delivery: 'pickup' },
      { id: 'tr-002', type: 'unofficial', copies: 1, status: 'processing', requested_at: '2026-04-05', completed_at: null, delivery: 'email' },
    ],
  },

  '/api/v1/services/requests': {
    success: true,
    data: [
      {
        id: 'svc-001',
        type: 'twimc',
        status: 'in_progress',
        reference_no: 'CCK-2026-04-0011',
        created_at: '2026-04-22T09:30:00Z',
        updated_at: '2026-04-23T11:10:00Z',
        title_ar: 'طلب To Whom It May Concern',
        title_en: 'To Whom It May Concern Request',
        category: 'registration',
        funding_path: 'puc',
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-22T09:30:00Z' },
          { key: 'payment', label_ar: 'الدفع الإلكتروني', label_en: 'Online Payment', state: 'done', timestamp: '2026-04-22T09:34:00Z' },
          { key: 'registration', label_ar: 'قسم التسجيل', label_en: 'Registration Department', state: 'current', comment_ar: 'قيد الإعداد', comment_en: 'In preparation' },
          { key: 'completed', label_ar: 'جاهز للاستلام', label_en: 'Ready for Pickup', state: 'upcoming' },
        ],
        attachments: [],
      },
      {
        id: 'svc-002',
        type: 'absence_excuse',
        status: 'completed',
        reference_no: 'CCK-2026-04-0008',
        created_at: '2026-04-12T08:00:00Z',
        updated_at: '2026-04-15T14:00:00Z',
        title_ar: 'عذر غياب',
        title_en: 'Excused Absence',
        category: 'registration',
        funding_path: null,
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-12T08:00:00Z' },
          { key: 'review', label_ar: 'مراجعة الوثيقة الطبية', label_en: 'Medical Document Review', state: 'done', timestamp: '2026-04-13T10:00:00Z' },
          { key: 'sis_applied', label_ar: 'تم الاحتساب في النظام', label_en: 'Applied in SIS', state: 'done', timestamp: '2026-04-15T14:00:00Z' },
        ],
        attachments: [
          { id: 'att-001', name: 'medical-cert.pdf', size_kb: 412, uploaded_at: '2026-04-12T08:00:00Z', kind: 'medical' },
        ],
      },
      {
        id: 'svc-003',
        type: 'social_allowance',
        status: 'pending_puc',
        reference_no: 'CCK-2026-04-0014',
        created_at: '2026-04-18T11:20:00Z',
        updated_at: '2026-04-20T09:15:00Z',
        title_ar: 'طلب الإعانة الاجتماعية',
        title_en: 'Social Allowance Application',
        category: 'finance',
        funding_path: 'puc',
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-18T11:20:00Z' },
          { key: 'cck_review', label_ar: 'مراجعة الوثائق', label_en: 'Documents Review', state: 'done', timestamp: '2026-04-19T08:00:00Z' },
          { key: 'puc', label_ar: 'إرسال إلى مجلس الجامعات الخاصة', label_en: 'Sent to PUC', state: 'current', timestamp: '2026-04-20T09:15:00Z' },
          { key: 'completed', label_ar: 'مكتمل', label_en: 'Completed', state: 'upcoming' },
        ],
        attachments: [
          { id: 'att-101', name: 'civil-id.pdf', size_kb: 220, uploaded_at: '2026-04-18T11:20:00Z', kind: 'civil_id' },
          { id: 'att-102', name: 'salary-certificate.pdf', size_kb: 187, uploaded_at: '2026-04-18T11:21:00Z', kind: 'proof' },
        ],
      },
      {
        id: 'svc-004',
        type: 'semester_withdrawal',
        status: 'pending_advisor',
        reference_no: 'CCK-2026-04-0021',
        created_at: '2026-04-24T14:00:00Z',
        updated_at: '2026-04-24T14:00:00Z',
        title_ar: 'طلب انسحاب من الفصل',
        title_en: 'Semester Withdrawal Request',
        category: 'registration',
        funding_path: 'puc',
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-24T14:00:00Z' },
          { key: 'advisor', label_ar: 'مراجعة المرشد الأكاديمي', label_en: 'Academic Advisor Review', state: 'current' },
          { key: 'puc_forms', label_ar: 'نماذج تجميد البعثة وإيقاف القيد', label_en: 'PUC Scholarship Freeze + Enrollment Hold Forms', state: 'upcoming' },
          { key: 'registration', label_ar: 'قسم التسجيل', label_en: 'Registration', state: 'upcoming' },
          { key: 'completed', label_ar: 'مكتمل', label_en: 'Completed', state: 'upcoming' },
        ],
        attachments: [
          { id: 'att-201', name: 'withdrawal-form-signed.pdf', size_kb: 502, uploaded_at: '2026-04-24T14:00:00Z', kind: 'form' },
        ],
      },
      {
        id: 'svc-005',
        type: 'social_allowance',
        status: 'rejected',
        reference_no: 'CCK-2026-04-0017',
        created_at: '2026-04-19T10:00:00Z',
        updated_at: '2026-04-21T09:45:00Z',
        title_ar: 'طلب الإعانة الاجتماعية',
        title_en: 'Social Allowance Application',
        category: 'finance',
        funding_path: 'puc',
        rejected_at: '2026-04-21T09:45:00Z',
        rejected_by_ar: 'الإدارة المالية',
        rejected_by_en: 'Finance Office',
        rejection_reason_ar:
          'بعض الوثائق المرفقة غير واضحة أو منتهية الصلاحية. يرجى تعديل المرفقات وإعادة الإرسال.',
        rejection_reason_en:
          'Some attached documents are unclear or expired. Please amend the rejected documents and resubmit.',
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-19T10:00:00Z' },
          { key: 'cck_review', label_ar: 'مراجعة الوثائق', label_en: 'Documents Review', state: 'done', timestamp: '2026-04-20T13:30:00Z' },
          {
            key: 'rejected',
            label_ar: 'مرفوض من الإدارة المالية',
            label_en: 'Rejected by Finance Office',
            state: 'rejected',
            comment_ar: 'يلزم تعديل المرفقات المرفوضة وإعادة الإرسال.',
            comment_en: 'Rejected attachments must be amended and resubmitted.',
            timestamp: '2026-04-21T09:45:00Z',
          },
          { key: 'puc', label_ar: 'إرسال إلى مجلس الجامعات الخاصة', label_en: 'Sent to PUC', state: 'upcoming' },
          { key: 'completed', label_ar: 'مكتمل', label_en: 'Completed', state: 'upcoming' },
        ],
        attachments: [
          {
            id: 'att-301',
            name: 'civil-id.pdf',
            size_kb: 220,
            uploaded_at: '2026-04-19T10:00:00Z',
            kind: 'civil_id',
            status: 'approved',
          },
          {
            id: 'att-302',
            name: 'salary-certificate.pdf',
            size_kb: 187,
            uploaded_at: '2026-04-19T10:01:00Z',
            kind: 'proof',
            status: 'rejected',
            rejection_reason_ar: 'شهادة الراتب منتهية الصلاحية — يجب أن تكون مؤرخة خلال آخر 30 يوماً.',
            rejection_reason_en: 'Salary certificate is expired — must be dated within the last 30 days.',
          },
          {
            id: 'att-303',
            name: 'guardian-id.pdf',
            size_kb: 145,
            uploaded_at: '2026-04-19T10:02:00Z',
            kind: 'civil_id',
            status: 'rejected',
            rejection_reason_ar: 'الصورة غير واضحة — يرجى رفع نسخة أوضح بدقة أعلى.',
            rejection_reason_en: 'Image is blurry — please upload a clearer, higher-resolution scan.',
          },
        ],
      },
      {
        id: 'svc-006',
        type: 'twimc',
        status: 'submitted',
        reference_no: 'CCK-2026-04-0032',
        created_at: '2026-04-25T13:00:00Z',
        updated_at: '2026-04-25T13:00:00Z',
        title_ar: 'طلب To Whom It May Concern',
        title_en: 'To Whom It May Concern Request',
        category: 'registration',
        funding_path: 'self',
        payment_status: 'pending',
        outstanding_balance_kwd: 487.5,
        workflow: [
          { key: 'submitted', label_ar: 'تم الإرسال', label_en: 'Submitted', state: 'done', timestamp: '2026-04-25T13:00:00Z' },
          { key: 'payment', label_ar: 'سداد الرصيد المستحق', label_en: 'Clear Outstanding Balance', state: 'current' },
          { key: 'registration', label_ar: 'قسم التسجيل', label_en: 'Registration Department', state: 'upcoming' },
          { key: 'completed', label_ar: 'جاهز للاستلام', label_en: 'Ready for Pickup', state: 'upcoming' },
        ],
        attachments: [],
      },
    ],
  },

  // Clearance Workflow (Finance Department doc) — student clearance status
  // across departments, required for graduation / withdrawal processing.
  '/api/v1/students/me/clearance': {
    success: true,
    data: {
      overall: 'pending',
      updated_at: '2026-05-19T10:00:00Z',
      departments: [
        { key: 'finance', name_ar: 'الإدارة المالية', name_en: 'Finance', status: 'cleared', note_ar: 'لا توجد مستحقات مالية', note_en: 'No outstanding balance' },
        { key: 'library', name_ar: 'المكتبة', name_en: 'Library', status: 'cleared', note_ar: 'لا توجد كتب مستعارة', note_en: 'No borrowed items' },
        { key: 'it', name_ar: 'تقنية المعلومات', name_en: 'IT', status: 'pending', note_ar: 'بانتظار إرجاع عهدة الأجهزة', note_en: 'Pending return of issued equipment' },
        { key: 'registration', name_ar: 'قسم التسجيل', name_en: 'Registration', status: 'pending', note_ar: 'بانتظار التحقق من السجل الأكاديمي', note_en: 'Pending academic record review' },
      ],
    },
  },

  '/api/v1/services/contact-directory': {
    success: true,
    data: [
      { id: 'cd-001', department_ar: 'قسم التسجيل', department_en: 'Registration', email: 'registration@cck.edu.kw', phone: '+965 1234 5601', category: 'registration' },
      { id: 'cd-002', department_ar: 'قسم القبول', department_en: 'Admissions', email: 'admissions@cck.edu.kw', phone: '+965 1234 5602', category: 'admissions' },
      { id: 'cd-003', department_ar: 'القسم المالي', department_en: 'Finance', email: 'finance@cck.edu.kw', phone: '+965 1234 5603', category: 'finance' },
      { id: 'cd-004', department_ar: 'شؤون الطلاب', department_en: 'Student Life', email: 'studentlife@cck.edu.kw', phone: '+965 1234 5604', category: 'student_life' },
      { id: 'cd-005', department_ar: 'تقنية المعلومات', department_en: 'IT Helpdesk', email: 'it@cck.edu.kw', phone: '+965 1234 5605', category: 'it' },
      { id: 'cd-006', department_ar: 'كلية إدارة الأعمال', department_en: 'School of Business', email: 'business@cck.edu.kw', category: 'academic' },
      { id: 'cd-007', department_ar: 'كلية التقنية المتقدمة والعلوم التطبيقية', department_en: 'School of Advanced Technology & Applied Sciences', email: 'technology@cck.edu.kw', category: 'academic' },
      { id: 'cd-008', department_ar: 'كلية الأساسيات والتعليم العام', department_en: 'School of Foundations & General Education', email: 'foundation@cck.edu.kw', category: 'academic' },
    ],
  },

  '/api/v1/services/excused-absence/policy': {
    success: true,
    data: {
      validity_days: 5,
      body_en:
        'Medical or official excuses must be issued by an approved medical authority (public or private hospital, clinic, or dispensary) and must carry the stamp of the doctor and the facility. Excuses must be submitted to Student Administrative Affairs within 5 working days of the absence date. Submissions outside this window or without an official stamp are rejected automatically. Acceptable excuses for missing exams: hospital admission, or death of a first-degree relative.',
      body_ar:
        'يجب أن تكون الشهادة الطبية أو العذر الرسمي صادراً من جهة معتمدة (مستشفى أو عيادة أو مستوصف، حكومي أو خاص) وأن يحمل ختم الطبيب وختم الجهة. يجب تسليم العذر إلى الشؤون الإدارية للطلبة خلال 5 أيام عمل من تاريخ الغياب. الأعذار خارج هذه المدة أو بدون ختم رسمي تُرفض تلقائياً. الأعذار المقبولة للتغيب عن الاختبارات: دخول المستشفى أو حالات الوفاة من الدرجة الأولى.',
      updated_at: '2026-05-06T00:00:00Z',
    },
  },

  // Social Allowance requirements (CCK Hub Feedback v3) — keyed by applicant flow,
  // because the document order differs for newly-admitted vs expected-to-graduate.
  // The bank-change shape is the same regardless of flow.
  '/api/v1/services/social-allowance/requirements': {
    success: true,
    data: {
      newly_admitted: {
        kuwaiti: [
          { key: 'form_social_allowance', label_ar: 'استمارة طلب الدعم الاجتماعي', label_en: 'Form For Social Allowance', required: true },
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'bank_transfer', label_ar: 'شهادة تحويل بنكي', label_en: 'Bank Transfer Certificate', required: true },
          { key: 'student_schedule', label_ar: 'جدول الطالب (يُربط بنظام SIS)', label_en: 'Student Schedule (linked with SIS)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
        ],
        kuwaiti_mother_dependant: [
          { key: 'form_social_allowance', label_ar: 'استمارة طلب الدعم الاجتماعي', label_en: 'Form For Social Allowance', required: true },
          { key: 'civil_security_id', label_ar: 'البطاقة المدنية / الأمنية', label_en: 'Civil ID / Security ID', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'manpower', label_ar: 'شهادة من الهيئة العامة للقوى العاملة (سهل)', label_en: 'Manpower Certificate (Sahel)', required: true },
          { key: 'bank_transfer', label_ar: 'شهادة تحويل بنكي', label_en: 'Bank Transfer Certificate', required: true },
          { key: 'student_schedule', label_ar: 'جدول الطالب (يُربط بنظام SIS)', label_en: 'Schedule (linked with SIS)', required: true },
          { key: 'mother_civil_id', label_ar: 'صورة البطاقة المدنية للأم', label_en: 'Mother Civil ID', required: true },
          { key: 'mother_nationality', label_ar: 'جنسية الأم (سهل)', label_en: 'Mother Nationality (Sahel)', required: true },
          { key: 'mother_twimc', label_ar: 'شهادة لمن يهمه الأمر خاصة بالأم (سهل/وزارة الداخلية)', label_en: 'TWIMC for Mother (Sahel / Interior)', required: true },
          { key: 'birth_cert', label_ar: 'شهادة ميلاد الطالب', label_en: 'Student Birth Certificate', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
        ],
        disabled: [
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
          { key: 'disability_proof', label_ar: 'شهادة إثبات إعاقة من الهيئة العامة لذوي الإعاقة', label_en: 'Disability Proof from PADP', required: true },
        ],
        married: [
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
          { key: 'marriage_cert', label_ar: 'عقد الزواج', label_en: 'Marriage Certificate', required: true },
          { key: 'marriage_continuity', label_ar: 'شهادة استمرارية الزواج', label_en: 'Marriage Continuity Certificate', required: true },
          { key: 'spouse_civil_id', label_ar: 'البطاقة المدنية للزوجة', label_en: 'Civil ID for the Wife', required: true },
        ],
      },
      expected_graduation: {
        kuwaiti: [
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
        ],
        kuwaiti_mother_dependant: [
          { key: 'civil_security_id', label_ar: 'البطاقة المدنية / الأمنية', label_en: 'Civil ID / Security ID', required: true },
          { key: 'manpower', label_ar: 'شهادة من الهيئة العامة للقوى العاملة (سهل)', label_en: 'Manpower Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'mother_nationality', label_ar: 'جنسية الأم (سهل)', label_en: 'Mother Nationality (Sahel)', required: true },
          { key: 'mother_civil_id', label_ar: 'صورة البطاقة المدنية للأم', label_en: 'Mother Civil ID', required: true },
          { key: 'birth_cert', label_ar: 'شهادة ميلاد الطالب', label_en: 'Student Birth Certificate', required: true },
          { key: 'mother_twimc', label_ar: 'شهادة لمن يهمه الأمر خاصة بالأم (سهل/وزارة الداخلية)', label_en: 'TWIMC for Mother (Sahel / Interior)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
        ],
        disabled: [
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
          { key: 'disability_proof', label_ar: 'شهادة إثبات إعاقة من الهيئة العامة لذوي الإعاقة', label_en: 'Disability Proof from PADP', required: true },
        ],
        married: [
          { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
          { key: 'twimc', label_ar: 'شهادة لمن يهمه الأمر (CCK)', label_en: 'To Whom It May Concern (CCK)', required: true },
          { key: 'social_security', label_ar: 'شهادة من التأمينات الاجتماعية (سهل)', label_en: 'Social Security Certificate (Sahel)', required: true },
          { key: 'social_affairs', label_ar: 'شهادة من وزارة الشؤون (سهل)', label_en: 'Certificate from Ministry of Social Affairs (Sahel)', required: true },
          { key: 'puc_inquiry', label_ar: 'الاستعلام الإلكتروني لصرف المكافأة الاجتماعية', label_en: 'PUC Allowance Electronic Inquiry', required: true },
          { key: 'marriage_cert', label_ar: 'عقد الزواج', label_en: 'Marriage Certificate', required: true },
          { key: 'marriage_continuity', label_ar: 'شهادة استمرارية الزواج', label_en: 'Marriage Continuity Certificate', required: true },
          { key: 'spouse_civil_id', label_ar: 'البطاقة المدنية للزوجة', label_en: 'Civil ID for the Wife', required: true },
        ],
      },
      // Legacy flat shape preserved for older callers + bank_change (flow-agnostic).
      bank_change: [
        { key: 'civil_id', label_ar: 'البطاقة المدنية', label_en: 'Civil ID', required: true },
        { key: 'salary_transfer', label_ar: 'شهادة تحويل الراتب من البنك', label_en: 'Bank Salary Transfer Certificate', required: true },
        { key: 'cck_form', label_ar: 'استمارة تغيير البيانات البنكية CCK', label_en: 'CCK Change of Bank Details Form', required: true },
      ],
    },
  },
};

// Real CCK academic data overrides the static fixtures above.
export const mockResponses: Record<string, any> = {
  ...staticResponses,
  ...academicMockResponses,
};
