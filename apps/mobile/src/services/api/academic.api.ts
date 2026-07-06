import { API_PATHS } from '@masari/shared';
import type {
  StudentSummary,
  Section,
  GradeOverview,
  GradeBreakdown,
  AttendanceSummary,
  Assignment,
  PaymentDashboard,
  DegreeAudit,
  AdvisingAppointment,
} from '@masari/shared';
import { apiClient } from './client';

export const academicApi = {
  getStudentSummary: () => apiClient.get<StudentSummary>(API_PATHS.STUDENT_ME),

  getSchedule: () => apiClient.get<{ sections: Section[] }>(API_PATHS.STUDENT_SCHEDULE),

  getGrades: () => apiClient.get<GradeOverview>(API_PATHS.STUDENT_GRADES),

  getGradeDetail: (enrollmentId: string) =>
    apiClient.get<GradeBreakdown>(API_PATHS.STUDENT_GRADE_DETAIL(enrollmentId)),

  getAttendance: () => apiClient.get<AttendanceSummary[]>(API_PATHS.STUDENT_ATTENDANCE),

  getAssignments: () => apiClient.get<Assignment[]>(API_PATHS.STUDENT_ASSIGNMENTS),

  getFees: () => apiClient.get<PaymentDashboard>(API_PATHS.STUDENT_FEES),

  getDegreeAudit: () => apiClient.get<DegreeAudit>(API_PATHS.STUDENT_DEGREE_AUDIT),

  getCalendar: () => apiClient.get<any[]>(API_PATHS.STUDENT_CALENDAR),

  getAdvisingMeetings: () =>
    apiClient.get<AdvisingAppointment[]>(API_PATHS.STUDENT_ADVISING_MEETINGS),

  getAvailableCourses: () => apiClient.get<any[]>(API_PATHS.STUDENT_AVAILABLE_COURSES),

  registerCourse: (courseId: string) =>
    apiClient.post<any>(API_PATHS.STUDENT_REGISTER_COURSE(courseId)),
};
