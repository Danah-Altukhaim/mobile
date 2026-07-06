// Static CCK institutional reference data, extracted from the
// CCK Student Hub Docs. Generated data files are marked AUTO-GENERATED;
// regenerate them with the scripts under packages/shared/scripts/.

export { COURSES, getCourse, coursesByProgram } from './courses';
export { PROGRAMS, getProgram, programCourseCodes } from './programs';
export {
  FACULTY,
  INSTRUCTOR_AVAILABILITY,
  INSTRUCTOR_AVAILABILITY_NOTES,
  FACULTY_COURSE_OFFERINGS,
  coursesForInstructor,
} from './faculty';
export {
  EQUIVALENCY, PAAET_EQUIVALENCY, EQUIVALENCY_RULES,
  equivalencyForProgram, paaetEquivalencyForProgram,
} from './equivalency';
export { STUDENT_CLUBS } from './clubs';
export { IT_HELPDESK_CATEGORIES } from './it-helpdesk';
export { HELPDESK_DEPARTMENTS } from './helpdesk';
