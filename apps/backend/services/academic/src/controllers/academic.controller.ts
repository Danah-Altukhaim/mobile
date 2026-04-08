import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';

export class AcademicController {
  /** GET /api/v1/students/me */
  getStudentSummary = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: {
        student_id: 'STU-443012',
        university_id: 'kusa',
        name_ar: 'دانة بنت عبدالله العتيبي',
        name_en: 'Danah Abdullah Al-Otaibi',
        email: 'danah.otaibi@students.kusa.edu.sa',
        college_ar: 'كلية علوم الحاسب والمعلومات',
        college_en: 'College of Computer and Information Sciences',
        major_ar: 'هندسة البرمجيات',
        major_en: 'Software Engineering',
        level: 7,
        gpa: 3.45,
        status: 'active',
        academic_year: '1447-1448',
        semester_ar: 'الفصل الدراسي الثاني',
        semester_en: 'Second Semester',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/schedule */
  getSchedule = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: {
        semester_ar: 'الفصل الدراسي الثاني ١٤٤٧-١٤٤٨',
        semester_en: 'Second Semester 1447-1448',
        courses: [
          {
            enrollment_id: 'ENR-001',
            course_code: 'SWE 481',
            name_ar: 'هندسة البرمجيات المتقدمة',
            name_en: 'Advanced Software Engineering',
            section: '1',
            instructor_ar: 'د. نورة بنت محمد الشمري',
            instructor_en: 'Dr. Noura Al-Shammari',
            days: ['sunday', 'tuesday'],
            start_time: '08:00',
            end_time: '09:20',
            location_ar: 'مبنى ٦ - قاعة ٢٠٣',
            location_en: 'Building 6 - Room 203',
            credits: 3,
          },
          {
            enrollment_id: 'ENR-002',
            course_code: 'SWE 466',
            name_ar: 'اختبار البرمجيات وضمان الجودة',
            name_en: 'Software Testing & Quality Assurance',
            section: '2',
            instructor_ar: 'د. فهد بن سعد القحطاني',
            instructor_en: 'Dr. Fahad Al-Qahtani',
            days: ['sunday', 'tuesday'],
            start_time: '09:30',
            end_time: '10:50',
            location_ar: 'مبنى ٦ - معمل ١٠٥',
            location_en: 'Building 6 - Lab 105',
            credits: 3,
          },
          {
            enrollment_id: 'ENR-003',
            course_code: 'SWE 497',
            name_ar: 'مشروع التخرج ٢',
            name_en: 'Senior Project 2',
            section: '1',
            instructor_ar: 'د. سارة بنت خالد الدوسري',
            instructor_en: 'Dr. Sara Al-Dosari',
            days: ['monday', 'wednesday'],
            start_time: '11:00',
            end_time: '12:20',
            location_ar: 'مبنى ٦ - قاعة ٣٠١',
            location_en: 'Building 6 - Room 301',
            credits: 3,
          },
          {
            enrollment_id: 'ENR-004',
            course_code: 'IS 301',
            name_ar: 'أمن المعلومات',
            name_en: 'Information Security',
            section: '3',
            instructor_ar: 'أ. محمد بن أحمد الحربي',
            instructor_en: 'Mr. Mohammed Al-Harbi',
            days: ['monday', 'wednesday'],
            start_time: '08:00',
            end_time: '09:20',
            location_ar: 'مبنى ٦ - قاعة ١٠٢',
            location_en: 'Building 6 - Room 102',
            credits: 3,
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/grades */
  getGrades = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: {
        cumulative_gpa: 3.45,
        total_credits_earned: 102,
        total_credits_required: 136,
        semester_gpa: 3.62,
        semester_ar: 'الفصل الدراسي الثاني ١٤٤٧-١٤٤٨',
        semester_en: 'Second Semester 1447-1448',
        courses: [
          {
            enrollment_id: 'ENR-001',
            course_code: 'SWE 481',
            name_ar: 'هندسة البرمجيات المتقدمة',
            name_en: 'Advanced Software Engineering',
            credits: 3,
            grade: 'A',
            grade_points: 3.75,
            status: 'completed',
          },
          {
            enrollment_id: 'ENR-002',
            course_code: 'SWE 466',
            name_ar: 'اختبار البرمجيات وضمان الجودة',
            name_en: 'Software Testing & Quality Assurance',
            credits: 3,
            grade: 'B+',
            grade_points: 3.50,
            status: 'in_progress',
          },
          {
            enrollment_id: 'ENR-003',
            course_code: 'SWE 497',
            name_ar: 'مشروع التخرج ٢',
            name_en: 'Senior Project 2',
            credits: 3,
            grade: 'A+',
            grade_points: 4.00,
            status: 'in_progress',
          },
          {
            enrollment_id: 'ENR-004',
            course_code: 'IS 301',
            name_ar: 'أمن المعلومات',
            name_en: 'Information Security',
            credits: 3,
            grade: 'B',
            grade_points: 3.25,
            status: 'in_progress',
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/grades/:enrollmentId */
  getGradeBreakdown = (req: AuthRequest, res: Response): void => {
    const { enrollmentId } = req.params;

    res.json({
      success: true,
      data: {
        enrollment_id: enrollmentId,
        course_code: 'SWE 481',
        name_ar: 'هندسة البرمجيات المتقدمة',
        name_en: 'Advanced Software Engineering',
        breakdown: [
          { component_ar: 'الواجبات', component_en: 'Assignments', weight: 15, score: 13.5, max_score: 15 },
          { component_ar: 'الاختبار الفصلي الأول', component_en: 'Midterm 1', weight: 20, score: 17, max_score: 20 },
          { component_ar: 'الاختبار الفصلي الثاني', component_en: 'Midterm 2', weight: 20, score: 18, max_score: 20 },
          { component_ar: 'المشروع', component_en: 'Project', weight: 15, score: 14, max_score: 15 },
          { component_ar: 'الاختبار النهائي', component_en: 'Final Exam', weight: 30, score: 26, max_score: 30 },
        ],
        total_score: 88.5,
        max_score: 100,
        letter_grade: 'A',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/attendance */
  getAttendance = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          enrollment_id: 'ENR-001',
          course_code: 'SWE 481',
          name_ar: 'هندسة البرمجيات المتقدمة',
          name_en: 'Advanced Software Engineering',
          total_classes: 24,
          attended: 22,
          absent: 2,
          excused: 1,
          attendance_percentage: 91.67,
          warning: false,
        },
        {
          enrollment_id: 'ENR-002',
          course_code: 'SWE 466',
          name_ar: 'اختبار البرمجيات وضمان الجودة',
          name_en: 'Software Testing & Quality Assurance',
          total_classes: 24,
          attended: 20,
          absent: 4,
          excused: 2,
          attendance_percentage: 83.33,
          warning: true,
        },
        {
          enrollment_id: 'ENR-003',
          course_code: 'SWE 497',
          name_ar: 'مشروع التخرج ٢',
          name_en: 'Senior Project 2',
          total_classes: 16,
          attended: 16,
          absent: 0,
          excused: 0,
          attendance_percentage: 100,
          warning: false,
        },
        {
          enrollment_id: 'ENR-004',
          course_code: 'IS 301',
          name_ar: 'أمن المعلومات',
          name_en: 'Information Security',
          total_classes: 24,
          attended: 23,
          absent: 1,
          excused: 0,
          attendance_percentage: 95.83,
          warning: false,
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/assignments */
  getAssignments = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: [
        {
          id: 'ASG-101',
          enrollment_id: 'ENR-001',
          course_code: 'SWE 481',
          title_ar: 'تحليل متطلبات نظام إدارة المستشفيات',
          title_en: 'Hospital Management System Requirements Analysis',
          due_date: '2026-04-12T23:59:00Z',
          status: 'pending',
          max_score: 20,
          score: null,
        },
        {
          id: 'ASG-102',
          enrollment_id: 'ENR-002',
          course_code: 'SWE 466',
          title_ar: 'كتابة حالات اختبار لواجهة برمجة التطبيقات',
          title_en: 'API Test Case Writing',
          due_date: '2026-04-15T23:59:00Z',
          status: 'pending',
          max_score: 15,
          score: null,
        },
        {
          id: 'ASG-103',
          enrollment_id: 'ENR-003',
          course_code: 'SWE 497',
          title_ar: 'تقرير التقدم الأسبوعي - مشروع التخرج',
          title_en: 'Weekly Progress Report - Senior Project',
          due_date: '2026-04-10T23:59:00Z',
          status: 'pending',
          max_score: 10,
          score: null,
        },
        {
          id: 'ASG-104',
          enrollment_id: 'ENR-004',
          course_code: 'IS 301',
          title_ar: 'تحليل ثغرات أمنية في تطبيق ويب',
          title_en: 'Web Application Vulnerability Analysis',
          due_date: '2026-04-20T23:59:00Z',
          status: 'pending',
          max_score: 25,
          score: null,
        },
        {
          id: 'ASG-100',
          enrollment_id: 'ENR-001',
          course_code: 'SWE 481',
          title_ar: 'مخطط حالات الاستخدام',
          title_en: 'Use Case Diagram',
          due_date: '2026-04-01T23:59:00Z',
          status: 'graded',
          max_score: 15,
          score: 13.5,
        },
      ],
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/fees */
  getFees = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: {
        balance: 12500.0,
        currency: 'SAR',
        semester_ar: 'الفصل الدراسي الثاني ١٤٤٧-١٤٤٨',
        semester_en: 'Second Semester 1447-1448',
        fees: [
          {
            id: 'FEE-001',
            description_ar: 'رسوم الفصل الدراسي',
            description_en: 'Semester Tuition Fee',
            amount: 25000.0,
            status: 'partially_paid',
            due_date: '2026-02-15',
          },
          {
            id: 'FEE-002',
            description_ar: 'رسوم المكتبة',
            description_en: 'Library Fee',
            amount: 500.0,
            status: 'paid',
            due_date: '2026-02-15',
          },
          {
            id: 'FEE-003',
            description_ar: 'رسوم النشاط الطلابي',
            description_en: 'Student Activity Fee',
            amount: 1000.0,
            status: 'unpaid',
            due_date: '2026-04-30',
          },
        ],
        payments: [
          {
            id: 'PAY-001',
            amount: 12500.0,
            date: '2026-02-10',
            method_ar: 'بطاقة مدى',
            method_en: 'Mada Card',
            reference: 'TAP-abc123',
          },
          {
            id: 'PAY-002',
            amount: 500.0,
            date: '2026-02-10',
            method_ar: 'بطاقة مدى',
            method_en: 'Mada Card',
            reference: 'TAP-def456',
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** GET /api/v1/students/me/degree-audit */
  getDegreeAudit = (_req: AuthRequest, res: Response): void => {
    res.json({
      success: true,
      data: {
        program_ar: 'بكالوريوس هندسة البرمجيات',
        program_en: 'Bachelor of Software Engineering',
        total_credits_required: 136,
        total_credits_earned: 102,
        total_credits_remaining: 34,
        expected_graduation_ar: 'الفصل الدراسي الأول ١٤٤٨-١٤٤٩',
        expected_graduation_en: 'First Semester 1448-1449',
        categories: [
          {
            name_ar: 'متطلبات الجامعة',
            name_en: 'University Requirements',
            required: 24,
            completed: 24,
            remaining: 0,
            status: 'complete',
          },
          {
            name_ar: 'متطلبات الكلية',
            name_en: 'College Requirements',
            required: 30,
            completed: 30,
            remaining: 0,
            status: 'complete',
          },
          {
            name_ar: 'متطلبات التخصص الإجبارية',
            name_en: 'Major Core Requirements',
            required: 54,
            completed: 42,
            remaining: 12,
            status: 'in_progress',
          },
          {
            name_ar: 'متطلبات التخصص الاختيارية',
            name_en: 'Major Elective Requirements',
            required: 18,
            completed: 6,
            remaining: 12,
            status: 'in_progress',
          },
          {
            name_ar: 'المقررات الحرة',
            name_en: 'Free Electives',
            required: 10,
            completed: 0,
            remaining: 10,
            status: 'not_started',
          },
        ],
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
