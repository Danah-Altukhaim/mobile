import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { AcademicController } from '../controllers/academic.controller';

export function registerRoutes(app: Express): void {
  const controller = new AcademicController();

  app.get('/api/v1/students/me', authenticate, controller.getStudentSummary);
  app.get('/api/v1/students/me/schedule', authenticate, controller.getSchedule);
  app.get('/api/v1/students/me/grades', authenticate, controller.getGrades);
  app.get('/api/v1/students/me/grades/:enrollmentId', authenticate, controller.getGradeBreakdown);
  app.get('/api/v1/students/me/attendance', authenticate, controller.getAttendance);
  app.get('/api/v1/students/me/assignments', authenticate, controller.getAssignments);
  app.get('/api/v1/students/me/fees', authenticate, controller.getFees);
  app.get('/api/v1/students/me/degree-audit', authenticate, controller.getDegreeAudit);
  app.get('/api/v1/students/me/calendar', authenticate, controller.getCalendar);
  app.get('/api/v1/students/me/available-courses', authenticate, controller.getAvailableCourses);
  app.post('/api/v1/students/me/register-course/:courseId', authenticate, controller.registerCourse);
}
