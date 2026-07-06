import type { EnrollmentStatus } from './student';

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  term_id: string;
  status: EnrollmentStatus;
  grade: string | null;
  grade_points: number | null;
  created_at: string;
  updated_at: string;
}

export interface GradeOverview {
  cumulative_gpa: number;
  semester_gpa: number;
  credits_completed: number;
  credits_remaining: number;
  courses: CourseGrade[];
  /** Academic standing — drives the academic-warning surface (CCK Hub Update). */
  academic_standing?: 'good_standing' | 'probation';
  /** Critical-case category (CCK Hub Feedback v3) - low CGPA, Kuwaiti at-risk, etc. */
  critical_case?: import('../constants/academic-progression').CriticalCaseCategory | null;
}

export interface CourseGrade {
  enrollment_id: string;
  course_code: string;
  course_name_ar: string;
  course_name_en: string;
  grade: string | null;
  grade_points: number | null;
  credit_hours: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GradeBreakdown {
  enrollment_id: string;
  course_code: string;
  course_name_ar: string;
  course_name_en: string;
  components: GradeComponent[];
  final_grade: string | null;
}

export interface GradeComponent {
  name: string;
  weight: number;
  score: number | null;
  max_score: number;
  class_average: number | null;
}

export interface AttendanceRecord {
  id: string;
  enrollment_id: string;
  session_date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  source: string;
}

export interface AttendanceSummary {
  enrollment_id: string;
  course_code: string;
  course_name_ar: string;
  course_name_en: string;
  total_sessions: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
  absence_threshold: number;
}

export interface Assignment {
  id: string;
  section_id: string;
  lms_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number;
  type: 'homework' | 'quiz' | 'exam' | 'project';
  course_code: string;
  course_name_ar: string;
  course_name_en: string;
  submitted: boolean;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface DegreeAudit {
  total_credits_required: number;
  credits_completed: number;
  credits_in_progress: number;
  credits_remaining: number;
  completion_percentage: number;
  categories: DegreeCategory[];
}

export interface DegreeCategory {
  name_ar: string;
  name_en: string;
  required_credits: number;
  completed_credits: number;
  courses: {
    code: string;
    name_ar: string;
    name_en: string;
    credits: number;
    status: 'completed' | 'in_progress' | 'not_started';
    grade: string | null;
  }[];
}
