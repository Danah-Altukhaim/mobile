// Fallback mock data when PostgreSQL is not available.
// Course-bearing entities are derived from the real CCK catalog in
// @masari/shared and mirror the mobile app's demo student (Noura, Diploma of
// Computer Programming, semester 3) so every surface tells the same story.

import { getCourse, getProgram, STUDENT_CLUBS } from '@masari/shared';

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
  major_name_ar: 'دبلوم برمجة الحاسوب',
  major_name_en: 'Diploma of Computer Programming',
  cohort_year: 2024,
  enrollment_status: 'enrolled',
  gpa_cumulative: 3.45,
  preferred_language: 'ar',
  university_name_ar: 'الكلية الكندية في الكويت',
  university_name_en: 'Canadian College of Kuwait',
  currency: 'KWD',
  timezone: 'Asia/Kuwait',
};

export const mockUniversity = {
  id: universityId,
  name_ar: 'الكلية الكندية في الكويت',
  name_en: 'Canadian College of Kuwait',
  slug: 'cck',
  country: 'KW',
  primary_color: '#006341',
  secondary_color: '#76B82A',
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

// --- Real CCK catalog projection: Noura, Diploma of Computer Programming, sem 3 ---
const _program = getProgram('diploma-cp')!;
const _completedCodes = _program.semesters.filter((s) => s.number < 3).flatMap((s) => s.courses);
const _currentCodes = _program.semesters.find((s) => s.number === 3)!.courses;
const _futureCodes = _program.semesters.filter((s) => s.number > 3).flatMap((s) => s.courses);
const _completedGrades: Record<string, string> = {
  CST8101: 'A', CST8116: 'A-', CST8215: 'B+', CST8300: 'A', ENL1813: 'B+', MAT8001: 'B',
  CST2355: 'A-', CST8102: 'B+', CST8284: 'B', CST8285: 'A-', ENL1823: 'A', GED0022: 'B+',
};
const _gradePoints: Record<string, number> = {
  A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0,
};
const _enrId = (code: string) => `enr-${String(_currentCodes.indexOf(code) + 1).padStart(3, '0')}`;
const _disp = (code: string) => {
  const c = getCourse(code);
  return {
    course_code: code,
    course_name_en: c?.name_en ?? code,
    course_name_ar: c?.name_ar ?? c?.name_en ?? code,
    credit_hours: c?.credit_hours ?? 3,
  };
};
const _instructor = (code: string) => {
  // Real CCK faculty; Arabic names aren't in the source docs, so name_en is reused.
  const map: Record<string, string> = {
    CST2234: 'Ahmad Jaber Hadam Mayahi',
    CST2335: 'MennaTullah Serajeldin Roushdy Ali',
    CST8109: 'Seyed Ghasem Saatchi',
    CST8283: 'Tareq Ahmad Ali Al-Zayyat',
    CST8288: 'Seyed Ghasem Saatchi',
  };
  const name = map[code] ?? 'Ahmad Jaber Hadam Mayahi';
  return { instructor_name_ar: name, instructor_name_en: name };
};
const _slots: Record<string, { day: string; start_time: string; end_time: string; room: string }[]> = {
  CST2234: [{ day: 'sunday', start_time: '08:00', end_time: '10:00', room: 'B-201' }, { day: 'tuesday', start_time: '08:00', end_time: '10:00', room: 'B-201' }],
  CST2335: [{ day: 'sunday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' }, { day: 'tuesday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' }],
  CST8109: [{ day: 'monday', start_time: '08:00', end_time: '10:00', room: 'LAB-2' }, { day: 'wednesday', start_time: '08:00', end_time: '10:00', room: 'LAB-2' }],
  CST8283: [{ day: 'monday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' }, { day: 'wednesday', start_time: '10:15', end_time: '12:15', room: 'LAB-1' }],
  CST8288: [{ day: 'tuesday', start_time: '12:30', end_time: '14:30', room: 'B-203' }, { day: 'thursday', start_time: '12:30', end_time: '14:30', room: 'B-203' }],
};
const _completedCredits = _completedCodes.reduce((s, c) => s + (getCourse(c)?.credit_hours ?? 0), 0);
const _currentCredits = _currentCodes.reduce((s, c) => s + (getCourse(c)?.credit_hours ?? 0), 0);
const _cumulativeGpa = (() => {
  let pts = 0, cr = 0;
  for (const code of _completedCodes) {
    const g = _completedGrades[code];
    const c = getCourse(code);
    if (g && c) { pts += _gradePoints[g] * c.credit_hours; cr += c.credit_hours; }
  }
  return cr ? Math.round((pts / cr) * 100) / 100 : 0;
})();

export const mockSchedule = _currentCodes.map((code) => ({
  enrollment_id: _enrId(code),
  status: 'enrolled',
  ..._disp(code),
  schedule_slots: _slots[code] ?? [],
  room: _slots[code]?.[0].room ?? 'TBA',
  ..._instructor(code),
  term_name_ar: mockTerm.name_ar,
  term_name_en: mockTerm.name_en,
}));

export const mockGrades = {
  cumulative_gpa: _cumulativeGpa,
  credits_completed: _completedCredits,
  academic_standing: _cumulativeGpa >= 2.0 ? 'good_standing' : 'probation',
  gpa_history: [
    { term_name_ar: 'خريف ٢٠٢٤-٢٠٢٥', term_name_en: 'Fall 2024-2025', gpa: 3.45 },
    { term_name_ar: 'ربيع ٢٠٢٤-٢٠٢٥', term_name_en: 'Spring 2024-2025', gpa: 3.55 },
  ],
  courses: _currentCodes.map((code) => ({
    enrollment_id: _enrId(code),
    ..._disp(code),
    grade: null as string | null,
    grade_points: null as number | null,
    status: 'enrolled',
    term_name_ar: mockTerm.name_ar,
    term_name_en: mockTerm.name_en,
    term_id: termId,
  })),
};

const _absence: Record<string, { absent: number; excused: number; late: number }> = {
  CST2234: { absent: 0, excused: 1, late: 1 },
  CST2335: { absent: 1, excused: 0, late: 0 },
  CST8109: { absent: 2, excused: 1, late: 0 },
  CST8283: { absent: 0, excused: 0, late: 2 },
  CST8288: { absent: 1, excused: 2, late: 1 },
};
export const mockAttendance = _currentCodes.map((code) => {
  const a = _absence[code] ?? { absent: 0, excused: 0, late: 0 };
  const total = 16;
  const present = total - a.absent - a.excused - a.late;
  return {
    enrollment_id: _enrId(code),
    ..._disp(code),
    total_sessions: total,
    present,
    absent: a.absent,
    excused: a.excused,
    late: a.late,
    attendance_percentage: Math.round((present / total) * 1000) / 10,
    warning: a.absent * 2 >= 4, // 4-credit courses → first warning at 4 absent hours
  };
});

const _assignmentSpecs: { code: string; title_ar: string; title_en: string; due: string; max: number; type: string }[] = [
  { code: 'CST2234', title_ar: 'مخطط حالات الاستخدام', title_en: 'Use-Case Diagram', due: '2026-05-17T23:59:00Z', max: 20, type: 'homework' },
  { code: 'CST2335', title_ar: 'تطبيق واجهة الجوال', title_en: 'Mobile UI App', due: '2026-05-19T23:59:00Z', max: 30, type: 'project' },
  { code: 'CST8109', title_ar: 'اختبار قصير - برمجة المقابس', title_en: 'Quiz - Socket Programming', due: '2026-05-15T23:59:00Z', max: 10, type: 'quiz' },
  { code: 'CST8283', title_ar: 'تقرير الأعمال', title_en: 'Business Report Program', due: '2026-05-21T23:59:00Z', max: 25, type: 'homework' },
  { code: 'CST8288', title_ar: 'مشروع أنماط التصميم', title_en: 'Design Patterns Project', due: '2026-05-26T23:59:00Z', max: 40, type: 'project' },
];
export const mockAssignments = _assignmentSpecs.map((a, i) => ({
  id: `asg-${String(i + 1).padStart(3, '0')}`,
  title_ar: a.title_ar,
  title_en: a.title_en,
  ..._disp(a.code),
  due_date: a.due,
  max_score: a.max,
  type: a.type,
  enrollment_id: _enrId(a.code),
}));

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
  total_credits_required: _program.total_credits,
  credits_completed: _completedCredits,
  credits_in_progress: _currentCredits,
  credits_remaining: _program.total_credits - _completedCredits - _currentCredits,
  completion_percentage: Math.round((_completedCredits / _program.total_credits) * 100),
  courses: [
    ..._completedCodes.map((code) => {
      const c = getCourse(code);
      return {
        code,
        name_ar: c?.name_ar ?? c?.name_en ?? code,
        name_en: c?.name_en ?? code,
        credits: c?.credit_hours ?? 3,
        status: 'completed',
        grade: _completedGrades[code] ?? null,
      };
    }),
    ..._currentCodes.map((code) => {
      const c = getCourse(code);
      return {
        code,
        name_ar: c?.name_ar ?? c?.name_en ?? code,
        name_en: c?.name_en ?? code,
        credits: c?.credit_hours ?? 3,
        status: 'in_progress',
        grade: null as string | null,
      };
    }),
    ..._futureCodes.map((code) => {
      const c = getCourse(code);
      return {
        code,
        name_ar: c?.name_ar ?? c?.name_en ?? code,
        name_en: c?.name_en ?? code,
        credits: c?.credit_hours ?? 3,
        status: 'not_started',
        grade: null as string | null,
      };
    }),
  ],
};

export const mockEvents = [
  { id: 'evt-001', university_id: universityId, title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي', title_en: 'Workshop: Intro to AI', description_ar: 'تعرف على أساسيات الذكاء الاصطناعي', description_en: 'Learn AI fundamentals', start_time: '2026-04-12T14:00:00Z', end_time: '2026-04-12T16:00:00Z', location_ar: 'قاعة المؤتمرات الرئيسية', location_en: 'Main Conference Hall', organizer_type: 'university', category: 'workshop', capacity: 80, rsvp_count: 23, is_rsvped: false },
  { id: 'evt-002', university_id: universityId, title_ar: 'معرض المشاريع الطلابية', title_en: 'Student Projects Exhibition', description_ar: 'عرض مشاريع التخرج والمشاريع الابتكارية', description_en: 'Graduation and innovation projects showcase', start_time: '2026-04-15T10:00:00Z', end_time: '2026-04-15T15:00:00Z', location_ar: 'ساحة الجامعة', location_en: 'University Plaza', organizer_type: 'university', category: 'exhibition', capacity: 200, rsvp_count: 87, is_rsvped: false },
  { id: 'evt-003', university_id: universityId, title_ar: 'محاضرة: ريادة الأعمال في الكويت', title_en: 'Lecture: Entrepreneurship in Kuwait', description_ar: 'محاضرة من رائد أعمال كويتي ناجح', description_en: 'Lecture by a successful Kuwaiti entrepreneur', start_time: '2026-04-18T18:00:00Z', end_time: '2026-04-18T20:00:00Z', location_ar: 'القاعة الكبرى', location_en: 'Grand Hall', organizer_type: 'university', category: 'lecture', capacity: 150, rsvp_count: 45, is_rsvped: false },
];

// Real CCK student clubs (Student Life Department).
const _clubMeta: Record<string, { category: string; members: number; desc_ar: string; desc_en: string }> = {
  media: { category: 'media', members: 41, desc_ar: 'إنتاج المحتوى الإعلامي وتغطية فعاليات الكلية.', desc_en: 'Media content production and coverage of college events.' },
  community: { category: 'community', members: 56, desc_ar: 'مبادرات تطوعية وخدمة المجتمع.', desc_en: 'Volunteering initiatives and community service.' },
  'student-workers': { category: 'careers', members: 23, desc_ar: 'دعم الطلبة الذين يجمعون بين الدراسة والعمل.', desc_en: 'Support for students balancing study and work.' },
  'computer-science': { category: 'technology', members: 48, desc_ar: 'هاكاثونات وورش برمجة لطلبة التقنية.', desc_en: 'Hackathons and coding workshops for tech students.' },
  debate: { category: 'culture', members: 34, desc_ar: 'مناظرات وتدريب على الإلقاء والحجاج.', desc_en: 'Debates and training in public speaking and argumentation.' },
};
export const mockClubs = STUDENT_CLUBS.map((club) => {
  const meta = _clubMeta[club.slug] ?? { category: 'general', members: 20, desc_ar: '', desc_en: '' };
  return {
    id: `club-${club.slug}`,
    university_id: universityId,
    name_ar: club.name_ar ?? club.name_en,
    name_en: club.name_en,
    description_ar: meta.desc_ar,
    description_en: meta.desc_en,
    category: meta.category,
    member_count: meta.members,
    status: 'active',
    is_member: club.slug === 'computer-science',
  };
});

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

// Advising meetings scheduled by an advisor/admin (no-DB fallback store).
// createAdvisingMeeting pushes into this array when the database is unavailable.
export const mockAdvisingMeetings: any[] = [
  { id: 'adv-001', student_id: '770e8400-e29b-41d4-a716-446655440002', type: 'gpa_warning', title_ar: 'موعد إنذار المعدل', title_en: 'GPA Warning Appointment', advisor_ar: 'د. أحمد الغامدي', advisor_en: 'Dr. Ahmed Al-Ghamdi', scheduled_at: '2026-04-22T11:00:00Z', location_ar: 'مبنى التسجيل، مكتب 204', location_en: 'Registration Building, Office 204', notes_ar: 'يرجى إحضار الجدول الدراسي الحالي.', notes_en: 'Please bring your current course schedule.', status: 'scheduled' },
];

// Available courses for registration
// Next semester (semester 4) courses, offered as registrable sections.
const _seatRange = [12, 5, 0, 18, 22];
export const mockAvailableCourses = _futureCodes.map((code, i) => {
  const c = getCourse(code);
  const inst = _instructor(code);
  return {
    id: `sec-${code}`,
    course_code: code,
    name_ar: c?.name_ar ?? c?.name_en ?? code,
    name_en: c?.name_en ?? code,
    credits: c?.credit_hours ?? 3,
    prerequisites: c?.prerequisites ?? [],
    seats_available: _seatRange[i % _seatRange.length],
    total_seats: 35,
    instructor_name: inst.instructor_name_en,
    schedule: 'Sun/Tue 10:00-12:00',
  };
});

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
  { id: 'sg-001', course_code: 'CST8109', name_ar: 'مجموعة دراسة برمجة الشبكات', name_en: 'Network Programming Study Group', member_count: 8, next_meeting: '2026-05-16T16:00:00Z', location: 'Library Room L2' },
  { id: 'sg-002', course_code: 'CST8288', name_ar: 'مجموعة دراسة أنماط التصميم', name_en: 'Design Patterns Study Group', member_count: 5, next_meeting: '2026-05-17T14:00:00Z', location: 'Student Center SC1' },
  { id: 'sg-003', course_code: 'CST2335', name_ar: 'مجموعة دراسة برمجة الجوال', name_en: 'Mobile Programming Study Group', member_count: 6, next_meeting: '2026-05-18T10:00:00Z', location: 'Library Room L3' },
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
  { id: 'qa-004', question_ar: 'ما هي أسهل مادة عامة؟', question_en: 'What is the easiest general course?', answer_ar: 'يختلف حسب تخصصك، لكن GEN2003 نمط الحياة الصحية شائعة', answer_en: 'It depends on your major, but GEN2003 Healthy Lifestyle is popular', upvotes: 42, created_at: '2026-04-01' },
  { id: 'qa-005', question_ar: 'هل يمكنني تأجيل الامتحان النهائي؟', question_en: 'Can I defer my final exam?', answer_ar: 'فقط بعذر طبي موثق، قدم الطلب قبل أسبوع من الامتحان', answer_en: 'Only with documented medical excuse, submit request 1 week before exam', upvotes: 15, created_at: '2026-03-28' },
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
