// CCK Credit Transfer Policy v2.0 (BOT/GMs/VPA, Effective Spring 2025).
// Source: CCK Student Hub Docs/CCK Credit Transfer Policy _version 3.pdf.

export type CckSchool = 'business' | 'advanced_technology';

/** Section 4.2 — general rules for transferring credits from any accredited institution. */
export const TRANSFER_CONTENT_EQUIVALENCE_PCT = 70;   // §4.2.3
export const TRANSFER_MAX_AGE_YEARS = 7;              // §4.2.2
export const TRANSFER_MAX_DIPLOMA_FRACTION = 0.5;     // §4.2.4 — 50% of total credits
export const TRANSFER_MIN_APPLY_CGPA = 2.0;           // §4.2.9 — min CGPA to apply
export const TRANSFER_RECORD_DESIGNATION = 'CR';      // §4.2.5 — shown on transcript, GPA-neutral

/** Section 4.3.1 — PAAET graduates with cumulative GPA ≥ 2.67. */
export interface PaaetCategoryOneRule {
  min_cgpa: number;            // 2.67
  min_transferable_credits: number;  // 20
  min_grade_letter: string;    // 'C'
  cap_by_school: Record<CckSchool, number>;
  min_cck_credits_to_graduate: number;
}

export const PAAET_CATEGORY_ONE: PaaetCategoryOneRule = {
  min_cgpa: 2.67,
  min_transferable_credits: 20,
  min_grade_letter: 'C',
  cap_by_school: {
    business: 66,
    advanced_technology: 72,
  },
  min_cck_credits_to_graduate: 12,
};

/** Section 4.3.2 — PAAET graduates with GPA < 2.67 or non-graduates. */
export interface PaaetCategoryTwoRule {
  min_grade_letter: string;
  cap_by_school: Record<CckSchool, number>;
}

export const PAAET_CATEGORY_TWO: PaaetCategoryTwoRule = {
  min_grade_letter: 'C',
  cap_by_school: {
    business: 39,           // 50% of School of Business diploma (78 credits)
    advanced_technology: 42, // 50% of School of Advanced Technology diploma (84 credits)
  },
};

/** Section 4.3 footnote — Private University transfers use a lower grade floor. */
export const PRIVATE_UNIVERSITY_MIN_GRADE_LETTER = 'C-';

/** §5 — required application documents. */
export const TRANSFER_REQUIRED_DOCUMENTS = [
  { key: 'application_form',   label_en: 'Completed CCK Application Form',         label_ar: 'استمارة طلب الالتحاق بالكلية' },
  { key: 'credit_transfer',    label_en: 'Completed Credit Transfer Form',         label_ar: 'استمارة طلب معادلة المقررات' },
  { key: 'sealed_transcript',  label_en: 'Sealed Original Transcript of Study',    label_ar: 'كشف الدرجات الأصلي مختوماً' },
  { key: 'course_outlines',    label_en: 'Course Outlines',                        label_ar: 'وصف المقررات (Course Outlines)' },
] as const;

export type TransferCategory =
  | 'paaet_high'           // §4.3.1
  | 'paaet_low'            // §4.3.2
  | 'private_university'   // private accredited Kuwaiti
  | 'public_university';   // public accredited Kuwaiti

export interface TransferCategoryConfig {
  key: TransferCategory;
  label_en: string;
  label_ar: string;
  min_grade_letter: string;
}

export const TRANSFER_CATEGORIES: readonly TransferCategoryConfig[] = [
  { key: 'paaet_high',         label_en: 'PAAET graduate (CGPA ≥ 2.67)',           label_ar: 'خريج التطبيقي (معدل ≥ 2.67)',     min_grade_letter: 'C' },
  { key: 'paaet_low',          label_en: 'PAAET (CGPA < 2.67 or non-graduate)',    label_ar: 'التطبيقي (معدل < 2.67 أو غير متخرج)', min_grade_letter: 'C' },
  { key: 'private_university', label_en: 'Private Kuwaiti university',             label_ar: 'جامعة كويتية خاصة',                min_grade_letter: 'C-' },
  { key: 'public_university',  label_en: 'Public Kuwaiti university',              label_ar: 'جامعة كويتية حكومية',              min_grade_letter: 'C' },
] as const;

const GRADE_NUMERIC: Record<string, number> = {
  'A': 95, 'A-': 90, 'B+': 86, 'B': 83, 'B-': 80,
  'C+': 75, 'C': 70, 'C-': 66, 'D+': 63, 'D': 60, 'F': 0,
};

/** Returns true when the prior-institution grade meets the category floor. */
export function meetsTransferGrade(category: TransferCategory, grade: string): boolean {
  const cfg = TRANSFER_CATEGORIES.find((c) => c.key === category);
  if (!cfg) return false;
  const floor = GRADE_NUMERIC[cfg.min_grade_letter] ?? 70;
  const got = GRADE_NUMERIC[grade.trim().toUpperCase()] ?? 0;
  return got >= floor;
}

/** §4.3 — total credit cap for a category × CCK school. Returns -1 when there is no PAAET-specific cap. */
export function transferCreditCap(category: TransferCategory, school: CckSchool): number {
  if (category === 'paaet_high')   return PAAET_CATEGORY_ONE.cap_by_school[school];
  if (category === 'paaet_low')    return PAAET_CATEGORY_TWO.cap_by_school[school];
  // §4.2.4 — generic 50% of the program; the screen knows the program's total credits.
  return -1;
}
