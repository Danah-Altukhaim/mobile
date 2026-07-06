// Academic Warning & Progression Policy (CCK Hub Feedback v3, page 2).
// Source: CCK Student Hub Docs/CCK Hub Feedback.v3.pdf.

export type ProgramLevel = 'diploma' | 'bachelor';

export interface WarningTierRow {
  /** Inclusive minimum credits earned for this tier. */
  earned_min: number;
  /** Inclusive maximum credits earned. -1 = no upper bound. */
  earned_max: number;
  /** Minimum CGPA required to stay in good standing at this tier. */
  min_cgpa: number;
}

/** §"Academic Warning Policy" table (الحد الأدنى المطلوب للمعدل التراكمي). */
export const ACADEMIC_WARNING_POLICY: Record<ProgramLevel, readonly WarningTierRow[]> = {
  diploma: [
    { earned_min: 0,  earned_max: 20, min_cgpa: 1.30 },
    { earned_min: 21, earned_max: 42, min_cgpa: 1.55 },
    { earned_min: 43, earned_max: 62, min_cgpa: 1.80 },
    { earned_min: 63, earned_max: -1, min_cgpa: 2.00 },
  ],
  bachelor: [
    { earned_min: 0,  earned_max: 16, min_cgpa: 1.30 },
    { earned_min: 17, earned_max: 28, min_cgpa: 1.55 },
    { earned_min: 29, earned_max: 40, min_cgpa: 1.80 },
    { earned_min: 41, earned_max: -1, min_cgpa: 2.00 },
  ],
} as const;

export type ProgressionState =
  | 'good_standing'
  | 'first_warning'
  | 'second_warning'
  | 'probation'
  | 'final_probation'
  | 'suspension'
  | 'dismissal';

/** Returns the minimum CGPA (DS = Desired Standard) for the credits earned. */
export function desiredStandard(level: ProgramLevel, creditsEarned: number): number {
  const rows = ACADEMIC_WARNING_POLICY[level];
  for (const r of rows) {
    const upper = r.earned_max === -1 ? Infinity : r.earned_max;
    if (creditsEarned >= r.earned_min && creditsEarned <= upper) return r.min_cgpa;
  }
  return rows[rows.length - 1].min_cgpa;
}

/**
 * Academic Progression Policy flowchart (CCK Hub Feedback v3, page 2).
 *
 * Good Standing
 *   ↓ CGPA < DS                ↑ CGPA ≥ DS
 * 1st Warning
 *   ↓ CGPA < DS                ↑ CGPA ≥ DS
 * 2nd Warning
 *   ↓ CGPA < DS & semGPA ≥ 2.0  ↑ CGPA ≥ DS
 * Probation
 *   ↓ CGPA < DS & semGPA ≥ 2.0  ↑ CGPA ≥ DS
 * Final Probation
 *   ↓ CGPA < DS & semGPA < 2.0  ↑ CGPA above DS
 * Academic Suspension (one semester)
 *   ↓ CGPA still < DS
 * Academic Dismissal
 */
export function nextProgressionState(args: {
  current: ProgressionState;
  cgpa: number;
  semesterGpa: number;
  level: ProgramLevel;
  creditsEarned: number;
}): ProgressionState {
  const ds = desiredStandard(args.level, args.creditsEarned);
  const aboveDs = args.cgpa >= ds;
  const meetingSem = args.semesterGpa >= 2.0;

  if (aboveDs) return 'good_standing';
  // Below DS — escalate through the cycle.
  switch (args.current) {
    case 'good_standing':    return 'first_warning';
    case 'first_warning':    return 'second_warning';
    case 'second_warning':   return meetingSem ? 'probation' : 'suspension';
    case 'probation':        return meetingSem ? 'final_probation' : 'suspension';
    case 'final_probation':  return meetingSem ? 'final_probation' : 'suspension';
    case 'suspension':       return 'dismissal';
    case 'dismissal':        return 'dismissal';
    default:                 return 'first_warning';
  }
}

/** §"Conditions Of Critical Cases" (CCK Hub Feedback v3, page 2). */
export type CriticalCaseCategory =
  | 'low_cgpa'
  | 'kuwaiti_diploma'
  | 'kuwaiti_bachelor'
  | 'kuwaiti_diploma_grad';

export interface CriticalCaseRule {
  key: CriticalCaseCategory;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
}

export const CRITICAL_CASE_RULES: readonly CriticalCaseRule[] = [
  {
    key: 'low_cgpa',
    label_en: 'Low CGPA',
    label_ar: 'معدل تراكمي منخفض',
    description_en: 'Any student with a CGPA below 2.00.',
    description_ar: 'أي طالب معدله التراكمي أقل من 2.00.',
  },
  {
    key: 'kuwaiti_diploma',
    label_en: 'Kuwaiti Diploma at risk',
    label_ar: 'دبلوم كويتي - حالة حرجة',
    description_en: 'Kuwaiti Diploma student with CGPA below 2.50, age below 23, and ≤ 15 credits completed or enrolled.',
    description_ar: 'طالب دبلوم كويتي بمعدل أقل من 2.50، عمره دون 23 سنة، وأكمل أو سجّل في 15 ساعة كحد أقصى.',
  },
  {
    key: 'kuwaiti_bachelor',
    label_en: 'Kuwaiti Bachelor at risk',
    label_ar: 'بكالوريوس كويتي - حالة حرجة',
    description_en: 'Kuwaiti BA student age below 27, CGPA below 3.00, and ≤ 15 credits completed or enrolled — or ≥ 30 credits completed with 2.00 ≤ CGPA ≤ 2.51.',
    description_ar: 'طالب بكالوريوس كويتي عمره دون 27، معدله أقل من 3.00 وأكمل أو سجل في 15 ساعة كحد أقصى - أو أكمل 30 ساعة فأكثر بمعدل بين 2.00 و2.51.',
  },
  {
    key: 'kuwaiti_diploma_grad',
    label_en: 'Expected-to-graduate Kuwaiti',
    label_ar: 'كويتي متوقع التخرج',
    description_en: 'Kuwaiti Diploma student with 24 credits remaining and age below 27.',
    description_ar: 'طالب دبلوم كويتي تبقى له 24 ساعة وعمره دون 27.',
  },
] as const;

/**
 * Evaluate the CCK Hub Feedback v3 "Critical Cases" conditions for a student and
 * return the matching category (or null). The universal low-CGPA rule takes
 * precedence; the remaining rules are Kuwaiti-specific and depend on age,
 * program level, and credits completed/enrolled.
 */
export function evaluateCriticalCase(args: {
  cgpa: number;
  nationality?: string | null;
  level?: ProgramLevel | null;
  age?: number | null;
  /** Credits completed, or completed-plus-currently-enrolled (early students). */
  creditsCompletedOrEnrolled?: number | null;
  /** Credits already completed (used for the BA ≥30-credit branch). */
  creditsCompleted?: number | null;
  /** Credits remaining to graduate (used for the expected-to-graduate rule). */
  creditsRemaining?: number | null;
}): CriticalCaseCategory | null {
  const {
    cgpa,
    nationality,
    level,
    age,
    creditsCompletedOrEnrolled,
    creditsCompleted,
    creditsRemaining,
  } = args;

  // 1. Universal: any student below 2.00 CGPA.
  if (cgpa < 2.0) return 'low_cgpa';

  const isKuwaiti = (nationality ?? '').toLowerCase() === 'kuwaiti';
  if (!isKuwaiti) return null;

  const enrolled = creditsCompletedOrEnrolled ?? creditsCompleted ?? 0;
  const completed = creditsCompleted ?? 0;

  // 2. Kuwaiti Diploma at risk.
  if (
    level === 'diploma' &&
    cgpa < 2.5 &&
    age != null && age < 23 &&
    enrolled <= 15
  ) {
    return 'kuwaiti_diploma';
  }

  // 3. Kuwaiti Bachelor at risk.
  if (
    level === 'bachelor' &&
    age != null && age < 27 &&
    ((cgpa < 3.0 && enrolled <= 15) || (completed >= 30 && cgpa >= 2.0 && cgpa <= 2.51))
  ) {
    return 'kuwaiti_bachelor';
  }

  // 4. Expected-to-graduate Kuwaiti Diploma student.
  if (
    level === 'diploma' &&
    creditsRemaining != null && creditsRemaining <= 24 &&
    age != null && age < 27
  ) {
    return 'kuwaiti_diploma_grad';
  }

  return null;
}

/** Student advising meeting types — Calendar feedback section. */
export type AdvisingMeetingKey = 'gpa_warning' | 'absence_second_warning';

export interface AdvisingMeeting {
  key: AdvisingMeetingKey;
  label_en: string;
  label_ar: string;
  trigger_en: string;
  trigger_ar: string;
}

export const ADVISING_MEETINGS: readonly AdvisingMeeting[] = [
  {
    key: 'gpa_warning',
    label_en: 'GPA Warning Appointment',
    label_ar: 'موعد إنذار المعدل',
    trigger_en: 'Triggered when CGPA falls below the Desired Standard.',
    trigger_ar: 'يُحدد عند هبوط المعدل التراكمي تحت الحد الأدنى المطلوب.',
  },
  {
    key: 'absence_second_warning',
    label_en: 'Absence 2nd Warning Appointment',
    label_ar: 'موعد إنذار الغياب الثاني',
    trigger_en: 'Triggered when absences cross the 2nd-warning threshold for any course.',
    trigger_ar: 'يُحدد عند تجاوز ساعات الغياب لحد الإنذار الثاني في أي مقرر.',
  },
] as const;
