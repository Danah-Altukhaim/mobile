import { Response } from 'express';
import type { AuthRequest } from '@masari/backend-shared';
import { studentQueries, academicQueries } from '@masari/backend-shared';

export class AcademicController {
  /** GET /api/v1/students/me */
  getStudentSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await studentQueries.getStudentSummary(req.user.id);

      if (!data) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'STUDENT_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0627\u0644\u0628',
              message_en: 'Student data not found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getStudentSummary error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/schedule */
  getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getStudentSchedule(req.user.id);

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'SCHEDULE_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u062f\u0631\u0627\u0633\u064a',
              message_en: 'No schedule found for the current term',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getSchedule error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/grades */
  getGrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getStudentGrades(req.user.id);

      if (!data || data.courses.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'GRADES_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062f\u0631\u062c\u0627\u062a',
              message_en: 'No grades found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getGrades error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/grades/:enrollmentId */
  getGradeBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { enrollmentId } = req.params;
      const gradesData = await academicQueries.getStudentGrades(req.user.id);

      if (!gradesData || gradesData.courses.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'GRADES_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062f\u0631\u062c\u0627\u062a',
              message_en: 'No grades found',
            },
          ],
        });
        return;
      }

      const enrollment = gradesData.courses.find(
        (c: any) => c.enrollment_id === enrollmentId,
      );

      if (!enrollment) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'ENROLLMENT_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u062a\u0633\u062c\u064a\u0644',
              message_en: 'Enrollment not found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data: enrollment,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getGradeBreakdown error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/attendance */
  getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getAttendanceSummary(req.user.id);

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'ATTENDANCE_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0633\u062c\u0644 \u0627\u0644\u062d\u0636\u0648\u0631',
              message_en: 'No attendance records found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getAttendance error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/assignments */
  getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getStudentAssignments(req.user.id);

      if (!data || data.length === 0) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'ASSIGNMENTS_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0648\u0627\u062c\u0628\u0627\u062a',
              message_en: 'No assignments found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getAssignments error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/fees */
  getFees = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getStudentFees(req.user.id);

      if (!data) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'FEES_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0631\u0633\u0648\u0645',
              message_en: 'No fee records found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getFees error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };

  /** GET /api/v1/students/me/degree-audit */
  getDegreeAudit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = await academicQueries.getDegreeAudit(req.user.id);

      if (!data) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'DEGREE_AUDIT_NOT_FOUND',
              message_ar: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629',
              message_en: 'Degree audit data not found',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data,
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('getDegreeAudit error:', error);
      res.status(503).json({
        success: false,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message_ar: '\u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b',
            message_en: 'Service temporarily unavailable. Please try again later.',
          },
        ],
      });
    }
  };
}
