// CCK Grading System Policy v2.0 (BOT/GMs/VPA, Effective Fall 2025/2026).
// Source: CCK Student Hub Docs/CCK Grading System Policy.pdf.

export type LetterGrade =
  | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D+' | 'D'
  | 'F' | 'FA'
  // Non-GPA transcript designations.
  | 'CR' | 'I' | 'WF' | 'FSP';

export interface GradingTier {
  letter: LetterGrade;
  score_min: number;       // inclusive
  score_max: number;       // inclusive; -1 means no upper bound (A 95-100, etc.)
  points: number;          // GPA points per credit
  description_en: string;
  description_ar: string;
  affects_gpa: boolean;    // CR / I / WF / FSP don't count toward GPA
}

// Section 6 of the policy — 12 official rows.
export const GRADING_SCHEME: readonly GradingTier[] = [
  { letter: 'A',  score_min: 95, score_max: 100, points: 4.0,  description_en: '95-100',         description_ar: '100-95',         affects_gpa: true },
  { letter: 'A-', score_min: 90, score_max: 94,  points: 3.67, description_en: '90-94',          description_ar: '94-90',          affects_gpa: true },
  { letter: 'B+', score_min: 86, score_max: 89,  points: 3.33, description_en: '86-89',          description_ar: '89-86',          affects_gpa: true },
  { letter: 'B',  score_min: 83, score_max: 85,  points: 3.0,  description_en: '83-85',          description_ar: '85-83',          affects_gpa: true },
  { letter: 'B-', score_min: 80, score_max: 82,  points: 2.67, description_en: '80-82',          description_ar: '82-80',          affects_gpa: true },
  { letter: 'C+', score_min: 75, score_max: 79,  points: 2.33, description_en: '75-79',          description_ar: '79-75',          affects_gpa: true },
  { letter: 'C',  score_min: 70, score_max: 74,  points: 2.0,  description_en: '70-74',          description_ar: '74-70',          affects_gpa: true },
  { letter: 'C-', score_min: 66, score_max: 69,  points: 1.67, description_en: '66-69',          description_ar: '69-66',          affects_gpa: true },
  { letter: 'D+', score_min: 63, score_max: 65,  points: 1.33, description_en: '63-65',          description_ar: '65-63',          affects_gpa: true },
  { letter: 'D',  score_min: 60, score_max: 62,  points: 1.0,  description_en: '60-62',          description_ar: '62-60',          affects_gpa: true },
  { letter: 'F',  score_min: 0,  score_max: 59,  points: 0.0,  description_en: 'Below 60',       description_ar: 'أقل من 60',     affects_gpa: true },
  { letter: 'FA', score_min: -1, score_max: -1,  points: 0.0,  description_en: 'Failure of Absence', description_ar: 'الرسوب بالغياب', affects_gpa: true },
] as const;

/** Lookup table: letter → GPA points. */
export const GRADE_POINTS: Record<LetterGrade, number> = (() => {
  const map: Partial<Record<LetterGrade, number>> = {};
  for (const t of GRADING_SCHEME) map[t.letter] = t.points;
  // Non-GPA grades — kept at 0 but flagged via GPA_NEUTRAL_GRADES.
  map.CR = 0; map.I = 0; map.WF = 0; map.FSP = 0;
  return map as Record<LetterGrade, number>;
})();

/** Grades that do not contribute to the GPA (section 5.2, 5.5, FSP). */
export const GPA_NEUTRAL_GRADES: readonly LetterGrade[] = ['CR', 'I', 'WF', 'FSP'] as const;

/** Lowest passing grade for a Diploma / Bachelor course (section 5.5 + 9). */
export const PASS_GRADE: LetterGrade = 'D';

/** Minimum cumulative GPA to graduate (section 5.6). */
export const CGPA_GRADUATION_MIN = 2.0;

/**
 * Census Day = 21st calendar day after the semester start.
 * Withdrawals before this day carry no academic penalty; after it the course
 * receives a "WF" on the transcript.
 */
export const CENSUS_DAY_OFFSET_DAYS = 21;

/** Section 8 — FSP auto-converts to F if not upgraded within four months. */
export const FSP_RESOLUTION_WINDOW_MONTHS = 4;

/** Maximum number of repeats counted in CGPA per section 10.4. */
export const REPEAT_GRADE_THRESHOLD: LetterGrade = 'C-';

/** Section 7 — verbal classification ranges, English + Arabic. */
export interface VerbalClassification {
  key: string;
  min: number;
  max: number;
  label_en: string;
  label_ar: string;
}

export const VERBAL_CLASSIFICATIONS: readonly VerbalClassification[] = [
  { key: 'satisfactory',           min: 2.00, max: 2.32, label_en: 'Satisfactory',                    label_ar: 'مقبول' },
  { key: 'average',                min: 2.33, max: 2.66, label_en: 'Average',                         label_ar: 'جيد' },
  { key: 'above_average',          min: 2.67, max: 2.99, label_en: 'Above Average',                   label_ar: 'جيد مرتفع' },
  { key: 'good',                   min: 3.00, max: 3.32, label_en: 'Good',                            label_ar: 'جيد جدًا' },
  { key: 'very_good',              min: 3.33, max: 3.66, label_en: 'Very Good',                       label_ar: 'جيد جدًا مرتفع' },
  { key: 'excellent',              min: 3.67, max: 3.84, label_en: 'Excellent',                       label_ar: 'امتياز' },
  { key: 'excellent_honor',        min: 3.85, max: 3.94, label_en: 'Excellent (with honor)',          label_ar: 'امتياز (مع مرتبة الشرف)' },
  { key: 'excellent_high_honor',   min: 3.95, max: 4.00, label_en: 'Excellent (with high honor)',     label_ar: 'امتياز (مع مرتبة الشرف العليا)' },
] as const;

export function verbalClassificationFor(cgpa: number): VerbalClassification | null {
  if (cgpa < VERBAL_CLASSIFICATIONS[0].min) return null;
  for (const v of VERBAL_CLASSIFICATIONS) {
    if (cgpa >= v.min && cgpa <= v.max + 0.005) return v;
  }
  return null;
}

/** Convert a numeric raw score (0-100) to its letter grade per section 6. */
export function letterFromScore(score: number): LetterGrade {
  for (const t of GRADING_SCHEME) {
    if (t.score_min === -1) continue;          // skip FA, no score range
    if (score >= t.score_min && score <= t.score_max) return t.letter;
  }
  return 'F';
}

/** Convert a letter grade to its GPA points (returns 0 for unknown). */
export function pointsForLetter(letter: LetterGrade | string | null | undefined): number {
  if (!letter) return 0;
  return GRADE_POINTS[letter as LetterGrade] ?? 0;
}
