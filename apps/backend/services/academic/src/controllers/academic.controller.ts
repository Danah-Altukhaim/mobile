import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { studentQueries, academicQueries, isDbAvailable, mockData } from '@masari/backend-shared';

// Mutable copy for course registration
let availableCourses = mockData.mockAvailableCourses.map((c: any) => ({ ...c }));

export class AcademicController {
  /** GET /api/v1/students/me */
  getStudentSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockStudentSummary, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await studentQueries.getStudentSummary(req.user.id);
      if (!data) { res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'لم يتم العثور على بيانات الطالب', message_en: 'Student not found' }] }); return; }
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockStudentSummary, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/schedule */
  getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockSchedule, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getStudentSchedule(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockSchedule, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/grades */
  getGrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockGrades, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getStudentGrades(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockGrades, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/grades/:enrollmentId */
  getGradeBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
    const { enrollmentId } = req.params;
    const course = mockData.mockGrades.courses.find(c => c.enrollment_id === enrollmentId) || mockData.mockGrades.courses[0];
    const breakdown = {
      enrollment_id: enrollmentId,
      course_code: course.course_code,
      course_name_ar: course.course_name_ar,
      course_name_en: course.course_name_en,
      components: [
        { name: 'الواجبات', weight: 15, score: 13.5, max_score: 15, class_average: 12.0 },
        { name: 'الاختبار الفصلي', weight: 25, score: 21, max_score: 25, class_average: 18.5 },
        { name: 'المشروع', weight: 20, score: 18, max_score: 20, class_average: 15.0 },
        { name: 'الاختبار النهائي', weight: 40, score: 34, max_score: 40, class_average: 28.0 },
      ],
      final_grade: course.grade,
    };
    res.json({ success: true, data: breakdown, meta: { synced_at: new Date().toISOString() } });
  };

  /** GET /api/v1/students/me/attendance */
  getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockAttendance, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getAttendanceSummary(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockAttendance, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/assignments */
  getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockAssignments, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getStudentAssignments(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockAssignments, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/fees */
  getFees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockFees, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getStudentFees(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockFees, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/degree-audit */
  getDegreeAudit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockDegreeAudit, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.getDegreeAudit(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockDegreeAudit, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/calendar */
  getCalendar = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockAcademicCalendar, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
  };

  /** GET /api/v1/students/me/advising-meetings */
  getAdvisingMeetings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!isDbAvailable()) {
        res.json({ success: true, data: mockData.mockAdvisingMeetings, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
        return;
      }
      const data = await academicQueries.listAdvisingMeetings(req.user.id);
      res.json({ success: true, data, meta: { synced_at: new Date().toISOString() } });
    } catch (e: any) {
      if (e.message === 'DB_NOT_AVAILABLE') {
        res.json({ success: true, data: mockData.mockAdvisingMeetings, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
      } else {
        res.status(500).json({ success: false, errors: [{ code: 'INTERNAL_ERROR', message_ar: 'خطأ في الخادم', message_en: e.message }] });
      }
    }
  };

  /** GET /api/v1/students/me/available-courses */
  getAvailableCourses = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: availableCourses, meta: { synced_at: new Date().toISOString(), source: 'mock' } });
  };

  /** POST /api/v1/students/me/register-course/:courseId */
  registerCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const course = availableCourses.find((c: any) => c.id === courseId);
    if (!course) {
      res.status(404).json({ success: false, errors: [{ code: 'NOT_FOUND', message_ar: 'المادة غير موجودة', message_en: 'Course not found' }] });
      return;
    }
    if (course.seats_available <= 0) {
      res.status(409).json({ success: false, errors: [{ code: 'SECTION_FULL', message_ar: 'الشعبة ممتلئة', message_en: 'Section is full' }] });
      return;
    }
    course.seats_available -= 1;
    res.json({ success: true, data: course, meta: { synced_at: new Date().toISOString() } });
  };
}
