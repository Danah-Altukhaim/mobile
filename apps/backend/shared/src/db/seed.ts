import { pool, query } from './connection';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Seeding Masari database...\n');

  // Run migration first
  const migrationPath = path.join(__dirname, 'migration.sql');
  const migration = fs.readFileSync(migrationPath, 'utf-8');
  try {
    await pool.query(migration);
    console.log('✅ Migration applied');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('ℹ️  Schema already exists, skipping migration');
    } else {
      throw e;
    }
  }

  // University
  const uniResult = await query(
    `INSERT INTO universities (id, name_ar, name_en, slug, country, primary_color, secondary_color, timezone, currency, sso_provider)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
     RETURNING id`,
    [
      '550e8400-e29b-41d4-a716-446655440000',
      'جامعة الخليج للعلوم والتكنولوجيا',
      'Gulf University for Science and Technology',
      'gust',
      'KW',
      '#1B4D3E',
      '#D4AF37',
      'Asia/Kuwait',
      'KWD',
      'saml',
    ],
  );
  const universityId = uniResult.rows[0].id;
  console.log('✅ University created: GUST');

  // Term
  const termResult = await query(
    `INSERT INTO terms (id, university_id, name_ar, name_en, start_date, end_date, registration_start, registration_end, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT DO NOTHING RETURNING id`,
    [
      '660e8400-e29b-41d4-a716-446655440001',
      universityId,
      'الفصل الدراسي الثاني ٢٠٢٥-٢٠٢٦',
      'Spring Semester 2025-2026',
      '2026-01-15',
      '2026-05-30',
      '2025-12-01',
      '2026-01-10',
      'spring',
    ],
  );
  const termId = termResult.rows[0]?.id || '660e8400-e29b-41d4-a716-446655440001';
  console.log('✅ Term created: Spring 2025-2026');

  // Courses
  const courses = [
    { id: 'c001', code: 'CS101', name_ar: 'مقدمة في علوم الحاسب', name_en: 'Introduction to Computer Science', credits: 3, dept: 'CS' },
    { id: 'c002', code: 'MATH201', name_ar: 'الرياضيات التطبيقية', name_en: 'Applied Mathematics', credits: 3, dept: 'MATH' },
    { id: 'c003', code: 'ENG102', name_ar: 'اللغة الإنجليزية الأكاديمية', name_en: 'Academic English', credits: 3, dept: 'ENG' },
    { id: 'c004', code: 'IS210', name_ar: 'نظم المعلومات الإدارية', name_en: 'Management Information Systems', credits: 3, dept: 'IS' },
    { id: 'c005', code: 'BA100', name_ar: 'مبادئ إدارة الأعمال', name_en: 'Principles of Business Administration', credits: 3, dept: 'BA' },
  ];

  for (const c of courses) {
    await query(
      `INSERT INTO courses (id, university_id, code, name_ar, name_en, credit_hours, department_id, prerequisites)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '{}')
       ON CONFLICT (university_id, code) DO NOTHING`,
      [`${c.id}-${universityId}`.slice(0, 36).padEnd(36, '0'), universityId, c.code, c.name_ar, c.name_en, c.credits, c.dept],
    );
  }
  console.log('✅ 5 courses created');

  // Sections
  const sections = [
    { courseIdx: 0, instructor_ar: 'د. أحمد المطيري', instructor_en: 'Dr. Ahmed Al-Mutairi', slots: [{ day: 'sunday', start_time: '08:00', end_time: '09:30', room: 'B-201' }, { day: 'tuesday', start_time: '08:00', end_time: '09:30', room: 'B-201' }], room: 'B-201' },
    { courseIdx: 1, instructor_ar: 'د. فاطمة الراشد', instructor_en: 'Dr. Fatima Al-Rashid', slots: [{ day: 'sunday', start_time: '10:00', end_time: '11:30', room: 'A-105' }, { day: 'tuesday', start_time: '10:00', end_time: '11:30', room: 'A-105' }], room: 'A-105' },
    { courseIdx: 2, instructor_ar: 'أ. سارة العنزي', instructor_en: 'Ms. Sara Al-Enezi', slots: [{ day: 'monday', start_time: '13:00', end_time: '14:30', room: 'C-301' }, { day: 'wednesday', start_time: '13:00', end_time: '14:30', room: 'C-301' }], room: 'C-301' },
    { courseIdx: 3, instructor_ar: 'د. محمد الشمري', instructor_en: 'Dr. Mohammed Al-Shammari', slots: [{ day: 'monday', start_time: '08:00', end_time: '09:30', room: 'D-102' }, { day: 'wednesday', start_time: '08:00', end_time: '09:30', room: 'D-102' }], room: 'D-102' },
  ];

  const sectionIds: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const courseId = `${courses[s.courseIdx].id}-${universityId}`.slice(0, 36).padEnd(36, '0');
    const sectionId = `sec-${String(i + 1).padStart(3, '0')}-${universityId}`.slice(0, 36).padEnd(36, '0');
    await query(
      `INSERT INTO sections (id, course_id, term_id, instructor_name_ar, instructor_name_en, schedule_slots, room, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 30)
       ON CONFLICT DO NOTHING`,
      [sectionId, courseId, termId, s.instructor_ar, s.instructor_en, JSON.stringify(s.slots), s.room],
    );
    sectionIds.push(sectionId);
  }
  console.log('✅ 4 sections created');

  // Student - Noura (persona from PRD)
  const studentResult = await query(
    `INSERT INTO students (id, university_id, student_number, name_ar, name_en, email, phone, major_name_ar, major_name_en, cohort_year, enrollment_status, gpa_cumulative, preferred_language)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (university_id, student_number) DO UPDATE SET name_ar = EXCLUDED.name_ar
     RETURNING id`,
    [
      '770e8400-e29b-41d4-a716-446655440002',
      universityId,
      '202401001',
      'نورة الصباح',
      'Noura Al-Sabah',
      'noura@gust.edu.kw',
      '+96599001234',
      'علوم الحاسب',
      'Computer Science',
      2024,
      'enrolled',
      3.45,
      'ar',
    ],
  );
  const studentId = studentResult.rows[0].id;
  console.log('✅ Student created: Noura Al-Sabah');

  // Enrollments
  const enrollmentGrades: (string | null)[] = ['A-', 'B+', null, null]; // first two graded, last two in progress
  const gradePointMap: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7 };

  for (let i = 0; i < sectionIds.length; i++) {
    const grade = enrollmentGrades[i];
    await query(
      `INSERT INTO enrollments (id, student_id, section_id, term_id, status, grade, grade_points)
       VALUES ($1, $2, $3, $4, 'enrolled', $5, $6)
       ON CONFLICT (student_id, section_id) DO NOTHING`,
      [
        `enr-${String(i + 1).padStart(3, '0')}-${universityId}`.slice(0, 36).padEnd(36, '0'),
        studentId,
        sectionIds[i],
        termId,
        grade,
        grade ? gradePointMap[grade] || null : null,
      ],
    );
  }
  console.log('✅ 4 enrollments created');

  // Attendance records
  const enrollmentIds = Array.from({ length: 4 }, (_, i) =>
    `enr-${String(i + 1).padStart(3, '0')}-${universityId}`.slice(0, 36).padEnd(36, '0'),
  );
  const attendanceStatuses = ['present', 'present', 'present', 'absent', 'present', 'excused', 'present', 'present'];

  for (let e = 0; e < enrollmentIds.length; e++) {
    for (let d = 0; d < 8; d++) {
      const date = new Date('2026-01-20');
      date.setDate(date.getDate() + d * 7 + e);
      await query(
        `INSERT INTO attendance (enrollment_id, session_date, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (enrollment_id, session_date) DO NOTHING`,
        [enrollmentIds[e], date.toISOString().split('T')[0], attendanceStatuses[d]],
      );
    }
  }
  console.log('✅ Attendance records created');

  // Assignments
  const assignments = [
    { section: 0, title: 'واجب البرمجة الأول', due: '2026-04-12', max: 20, type: 'homework' },
    { section: 0, title: 'اختبار قصير - الأسبوع ٨', due: '2026-04-15', max: 10, type: 'quiz' },
    { section: 1, title: 'حل مسائل التكامل', due: '2026-04-18', max: 15, type: 'homework' },
    { section: 2, title: 'مقال أكاديمي', due: '2026-04-20', max: 25, type: 'project' },
    { section: 3, title: 'مشروع قاعدة البيانات', due: '2026-04-25', max: 30, type: 'project' },
  ];

  for (let i = 0; i < assignments.length; i++) {
    const a = assignments[i];
    await query(
      `INSERT INTO assignments (section_id, title, due_date, max_score, type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [sectionIds[a.section], a.title, a.due, a.max, a.type],
    );
  }
  console.log('✅ 5 assignments created');

  // Fees
  const fees = [
    { type: 'tuition', desc_ar: 'الرسوم الدراسية', desc_en: 'Tuition Fee', amount: 1000, due: '2026-02-15', paid: 500 },
    { type: 'lab', desc_ar: 'رسوم المختبر', desc_en: 'Lab Fee', amount: 150, due: '2026-02-15', paid: 150 },
    { type: 'registration', desc_ar: 'رسوم التسجيل', desc_en: 'Registration Fee', amount: 100, due: '2026-02-01', paid: 100 },
  ];

  for (const f of fees) {
    await query(
      `INSERT INTO fees (student_id, term_id, type, description_ar, description_en, amount, due_date, paid_amount, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'KWD')
       ON CONFLICT DO NOTHING`,
      [studentId, termId, f.type, f.desc_ar, f.desc_en, f.amount, f.due, f.paid],
    );
  }
  console.log('✅ 3 fees created');

  // Events
  const events = [
    { title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي', title_en: 'Workshop: Intro to AI', start: '2026-04-12T14:00:00Z', end: '2026-04-12T16:00:00Z', location: 'قاعة المؤتمرات الرئيسية', category: 'workshop', capacity: 80 },
    { title_ar: 'معرض المشاريع الطلابية', title_en: 'Student Projects Exhibition', start: '2026-04-15T10:00:00Z', end: '2026-04-15T15:00:00Z', location: 'ساحة الجامعة', category: 'exhibition', capacity: 200 },
    { title_ar: 'محاضرة: ريادة الأعمال في الكويت', title_en: 'Lecture: Entrepreneurship in Kuwait', start: '2026-04-18T18:00:00Z', end: '2026-04-18T20:00:00Z', location: 'القاعة الكبرى', category: 'lecture', capacity: 150 },
  ];

  for (const e of events) {
    await query(
      `INSERT INTO events (university_id, title_ar, title_en, start_time, end_time, location, organizer_type, category, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, 'university', $7, $8)
       ON CONFLICT DO NOTHING`,
      [universityId, e.title_ar, e.title_en, e.start, e.end, e.location, e.category, e.capacity],
    );
  }
  console.log('✅ 3 events created');

  // Clubs
  const clubs = [
    { name_ar: 'نادي البرمجة', name_en: 'Coding Club', desc_ar: 'نادي لمحبي البرمجة وتطوير البرمجيات', desc_en: 'A club for coding enthusiasts', category: 'technology' },
    { name_ar: 'نادي ريادة الأعمال', name_en: 'Entrepreneurship Club', desc_ar: 'دعم رواد الأعمال الشباب', desc_en: 'Supporting young entrepreneurs', category: 'business' },
    { name_ar: 'النادي الثقافي', name_en: 'Cultural Club', desc_ar: 'فعاليات ثقافية وأدبية متنوعة', desc_en: 'Diverse cultural and literary events', category: 'culture' },
  ];

  for (const c of clubs) {
    await query(
      `INSERT INTO clubs (university_id, name_ar, name_en, description_ar, description_en, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       ON CONFLICT DO NOTHING`,
      [universityId, c.name_ar, c.name_en, c.desc_ar, c.desc_en, c.category],
    );
  }
  console.log('✅ 3 clubs created');

  // Admin user
  await query(
    `INSERT INTO admin_users (university_id, email, name_ar, name_en, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (university_id, email) DO NOTHING`,
    [universityId, 'admin@gust.edu.kw', 'د. فهد العتيبي', 'Dr. Fahad Al-Otaibi', 'university_admin'],
  );
  console.log('✅ Admin user created');

  console.log('\n🎉 Seed complete! Database ready for development.\n');
  console.log('Student login: noura@gust.edu.kw');
  console.log('University: GUST (gust)');

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
