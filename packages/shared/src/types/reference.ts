// CCK institutional reference types — faculty, transfer-credit equivalency,
// student clubs, and the IT Helpdesk catalog. Sourced from the CCK Student
// Hub Docs; the data lives in packages/shared/src/data.

// ---------------------------------------------------------------------------
// Faculty
// ---------------------------------------------------------------------------

export type FacultyDept = 'business' | 'foundation' | 'advanced_technology';
export type Qualification = 'PhD' | 'Master' | 'Bachelor';
export type Employment = 'full_time' | 'part_time';

export interface FacultyMember {
  name_en: string;
  job_title: string;
  qualification: Qualification;
  department: FacultyDept;
  employment: Employment;
  /** Head of Department for their faculty. */
  is_hod: boolean;
  /** Total weekly teaching hours where the source recorded it. */
  teaching_load: number | null;
}

/** Availability / load rule by academic rank (Per-instructor Availability.xlsx). */
export interface InstructorAvailabilityRule {
  rank: string;
  qualification_band: string;
  days_available: number;
  teaching_hours_per_week: number;
}

/** A course an instructor is recorded as offering (List With Offered Courses
 *  By Staff.xlsx). `course_code` is null when the course name could not be
 *  matched to a catalog entry. */
export interface FacultyCourseOffering {
  /** Instructor name exactly as the offerings sheet lists it. */
  instructor_name_en: string;
  /** The matching FacultyMember.name_en, reconciled across the two sheets'
   *  differing name forms (titles, spelling). Null when no faculty row
   *  matched. Use this — not instructor_name_en — to join to FACULTY. */
  faculty_name_en: string | null;
  course_name_en: string;
  course_code: string | null;
}

// ---------------------------------------------------------------------------
// Transfer-credit equivalency (PAAET ↔ CCK)
// ---------------------------------------------------------------------------

/** One CCK course recognised as equivalent for students transferring from a
 *  given PAAET diploma (Equivalency - Courses List.xlsx, "CCK" sheet). */
export interface EquivalencyEntry {
  cck_course_name: string;
  /** Normalised course code (letters + 4 digits, suffix stripped). */
  cck_code: string | null;
  /** The course code exactly as the source sheet lists it — keeps section /
   *  variant suffixes (e.g. "ENL1813I", "ACC2201K") and multi-code cells
   *  (e.g. "ENL2019-ENL1823") that the normalised form discards. */
  cck_code_raw: string | null;
  cck_credit: number | null;
  cck_major: string;
  /** The PAAET diploma the equivalency applies to. */
  paaet_program: string;
  remarks: string | null;
}

/** One PAAET course mapped to a CCK major (Equivalency - Courses List.xlsx,
 *  "PAAET" sheet). The reverse direction of EquivalencyEntry — used to look up
 *  what a specific PAAET course transfers as, including bridge-course flags. */
export interface PaaetEquivalencyEntry {
  paaet_course_name: string;
  paaet_code: string;
  credit: string;
  /** The PAAET diploma the course belongs to. */
  paaet_program: string;
  /** The CCK major the course is recognised toward. */
  cck_major: string;
  /** Remarks such as "Bridge Course" or "In Computer Diploma". */
  remarks: string | null;
}

// ---------------------------------------------------------------------------
// Student clubs (Student Life Department.docx)
// ---------------------------------------------------------------------------

export interface StudentClub {
  slug: string;
  name_en: string;
  name_ar: string | null;
}

// ---------------------------------------------------------------------------
// IT Helpdesk (CCK Hub IT Department.docx)
// ---------------------------------------------------------------------------

export interface ITHelpdeskCategory {
  slug: string;
  name_en: string;
  name_ar: string;
  /** Common problems students can pick from when raising a ticket. */
  problems_en: string[];
  problems_ar: string[];
}

// ---------------------------------------------------------------------------
// General Helpdesk — department-scoped issue catalog. The IT Department doc
// requires support requests to be categorised by the department they relate
// to; the helpdesk screen surfaces a department picker followed by a
// department-dependent issue picker.
// ---------------------------------------------------------------------------

export interface HelpdeskIssue {
  slug: string;
  label_en: string;
  label_ar: string;
}

export interface HelpdeskDepartment {
  slug: string;
  name_en: string;
  name_ar: string;
  /** Contact mailbox a ticket for this department is routed to. */
  email: string;
  issues: HelpdeskIssue[];
}
