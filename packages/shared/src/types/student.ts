export type EnrollmentStatus = 'enrolled' | 'dropped' | 'withdrawn' | 'completed' | 'suspended';

export type FundingType = 'self' | 'puc' | 'scholarship' | 'other';

export interface Student {
  id: string;
  university_id: string;
  student_number: string;
  name_ar: string;
  name_en: string;
  email: string;
  phone: string | null;
  major_id: string | null;
  major_name_ar: string | null;
  major_name_en: string | null;
  cohort_year: number;
  enrollment_status: EnrollmentStatus;
  gpa_cumulative: number | null;
  avatar_url: string | null;
  preferred_language: 'ar' | 'en';
  funding_type: FundingType | null;
  created_at: string;
  updated_at: string;
}

export interface StudentSummary {
  student: Student;
  current_term: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  today_classes_count: number;
  upcoming_deadlines_count: number;
  balance_due: number | null;
  currency: string;
  unread_notifications: number;
}

/** An advising appointment scheduled for a student by an advisor/admin.
 *  Surfaced on the student's Academic Calendar once it is created. */
export interface AdvisingAppointment {
  id: string;
  /** Meeting category, e.g. 'gpa_warning' | 'absence_second_warning' | 'general'. */
  type: string;
  title_ar: string;
  title_en: string;
  advisor_ar: string;
  advisor_en: string;
  /** ISO timestamp of the scheduled meeting. */
  scheduled_at: string;
  location_ar: string;
  location_en: string;
  notes_ar?: string | null;
  notes_en?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
}
