export { API_PATHS } from './api-paths';
export { ERROR_CODES } from './errors';
export {
  FOUNDATION_THRESHOLDS,
  DEGREE_THRESHOLDS_BY_CREDITS,
  ATTENDANCE_POLICY_NOTES,
  EXCUSE_SUBMISSION_WINDOW_DAYS,
  getAttendanceThresholds,
  attendanceLevel,
} from './attendance-policy';
export type {
  AttendanceTrack,
  AttendanceThresholds,
  AttendanceLevel,
} from './attendance-policy';
export {
  CURRENCY,
  CREDIT_PRICE_KWD,
  FOUNDATION_SEMESTER_FEE_KWD,
  STANDARD_GRANT_RATE,
  SPORT_DISCOUNT_RATE,
  STUDENT_SERVICE_FEE_KWD,
  REGISTRATION_FEE_KWD,
  SEAT_RESERVATION_FEE_KWD,
  MISC_FEES_KWD,
  NON_REFUNDABLE_FEES,
  WITHDRAWAL_FINE_BY_WEEK,
  withdrawalFineRate,
  calcWithdrawalFine,
  INSTALLMENT_WEEKS,
  INSTALLMENT_SPLIT,
  buildInstallments,
  CCK_PAYMENT_METHODS,
  calcTuition,
  FINANCE_POLICY_NOTES,
} from './fees';
export type {
  ProgramTrack,
  MiscFeeType,
  Installment,
  TuitionBreakdown,
} from './fees';
export {
  MAX_CREDITS_PER_TERM,
  PUC_MIN_CREDITS_REGULAR,
  SELF_FUND_MIN_CREDITS,
  creditLoadRange,
} from './credit-load';
export type { CreditLoadRange } from './credit-load';
export {
  GRADING_SCHEME,
  GRADE_POINTS,
  GPA_NEUTRAL_GRADES,
  PASS_GRADE,
  CGPA_GRADUATION_MIN,
  CENSUS_DAY_OFFSET_DAYS,
  FSP_RESOLUTION_WINDOW_MONTHS,
  REPEAT_GRADE_THRESHOLD,
  VERBAL_CLASSIFICATIONS,
  verbalClassificationFor,
  letterFromScore,
  pointsForLetter,
} from './grading-policy';
export type { LetterGrade, GradingTier, VerbalClassification } from './grading-policy';
export {
  TRANSFER_CONTENT_EQUIVALENCE_PCT,
  TRANSFER_MAX_AGE_YEARS,
  TRANSFER_MAX_DIPLOMA_FRACTION,
  TRANSFER_MIN_APPLY_CGPA,
  TRANSFER_RECORD_DESIGNATION,
  PAAET_CATEGORY_ONE,
  PAAET_CATEGORY_TWO,
  PRIVATE_UNIVERSITY_MIN_GRADE_LETTER,
  TRANSFER_REQUIRED_DOCUMENTS,
  TRANSFER_CATEGORIES,
  meetsTransferGrade,
  transferCreditCap,
} from './credit-transfer-policy';
export type { CckSchool, TransferCategory, TransferCategoryConfig } from './credit-transfer-policy';
export {
  ACADEMIC_WARNING_POLICY,
  desiredStandard,
  nextProgressionState,
  CRITICAL_CASE_RULES,
  evaluateCriticalCase,
  ADVISING_MEETINGS,
} from './academic-progression';
export type {
  ProgramLevel,
  WarningTierRow,
  ProgressionState,
  CriticalCaseCategory,
  CriticalCaseRule,
  AdvisingMeetingKey,
  AdvisingMeeting,
} from './academic-progression';
