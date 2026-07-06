// CCK academic catalog reference types.
// These describe static institutional data (the course catalog and degree
// plans) sourced from the CCK Student Hub Docs — distinct from the per-student
// transactional entities in course.ts / enrollment.ts.

/** How a course is delivered. `lecture_lab` = split lecture + lab component. */
export type CourseType = 'lecture' | 'lab' | 'lecture_lab' | 'unknown';

/** Language(s) a course is offered in. `bilingual` covers Arabic + English. */
export type CourseLanguage = 'en' | 'ar' | 'bilingual' | 'unknown';

/** Stable slug for each CCK program (diploma, BBA, or BASc). */
export type ProgramSlug =
  | 'diploma-accounting'
  | 'diploma-marketing'
  | 'diploma-management'
  | 'diploma-cp'
  | 'diploma-iawd'
  | 'diploma-imd'
  | 'bba-accounting'
  | 'bba-management'
  | 'bba-marketing'
  | 'basc-cs';

/** One course in the CCK catalog. `name_ar` / `description_en` may be null
 *  where the source documents leave them blank — never fabricate them. */
export interface CatalogCourse {
  code: string;
  name_en: string;
  name_ar: string | null;
  credit_hours: number;
  course_type: CourseType;
  language: CourseLanguage;
  /** Program slugs this course appears in (a course can be shared). */
  programs: ProgramSlug[];
  /** Course codes that must be completed first. */
  prerequisites: string[];
  description_en: string | null;
}

/** One term's worth of courses inside a degree plan. */
export interface ProgramSemester {
  /** 1-based position in the plan (Semester 1..8). */
  number: number;
  year: number;
  /** Course codes scheduled for this semester. */
  courses: string[];
  /** Prerequisite course codes per course, exactly as the major sheet's
   *  PRE REQUISITE column lists them. Keyed by course code; courses with no
   *  prerequisite are omitted. Program-specific — the same course may carry
   *  different prerequisites in another plan. */
  prerequisites: Record<string, string[]>;
  /** Co-requisite course codes per course, captured from "CO REQUISITE:"
   *  entries in the major sheet's PRE REQUISITE column. Keyed by course code;
   *  courses with no co-requisite are omitted. */
  corequisites: Record<string, string[]>;
  total_credits: number;
}

/** A full CCK degree plan (major sheet). */
export interface DegreeProgram {
  slug: ProgramSlug;
  level: 'diploma' | 'bachelor';
  name_en: string;
  name_ar: string | null;
  total_credits: number;
  semesters: ProgramSemester[];
}
