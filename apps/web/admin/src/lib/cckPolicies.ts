// Canonical CCK policies pulled from the source-of-truth PDFs delivered by
// CCK in `CCK Student Hub Docs/`. The admin app should read every rule from
// here so the UI cannot drift from the published policy.
//
// Sources:
//   • CCK Hub Feedback.v3.pdf (the open feedback list applied here)
//   • CCK Credit Transfer Policy _version 3.pdf  (CCK Credit Transfer Policy v2.0)
//   • CCK Grading System Policy.pdf              (CCK Grading System Policy v2.0)

/* ─── Requests: TWIMC + Transcript finance hold ─── */

export const FINANCE_HOLD_REQUEST_TYPES = ['twimc', 'twimc_balance', 'transcript'] as const;
export type FinanceHoldRequestType = (typeof FINANCE_HOLD_REQUEST_TYPES)[number];

export interface FinanceHoldInputs {
  type: string;
  payment_status: 'paid' | 'pending' | 'not_required';
  outstanding_balance_kwd?: number;
}

/** True when a TWIMC/Transcript request must be blocked because the student
 *  has an outstanding balance or overdue installments. Feedback v3:
 *  "TWIMC & Transcript requests cannot be made unless pay outstanding
 *   balance/up to date with financial installments." */
export function isRequestOnFinanceHold(req: FinanceHoldInputs): boolean {
  if (!(FINANCE_HOLD_REQUEST_TYPES as readonly string[]).includes(req.type)) return false;
  const outstanding = req.outstanding_balance_kwd ?? 0;
  return req.payment_status === 'pending' && outstanding > 0;
}

/* ─── Academic requests: Change of Grade + Incomplete "I" (paper forms) ─── */

/** Change of Grade Form CCK: a grade submitted in error (data entry or
 *  computational) "will not be accepted by the Registrar's Office after the
 *  first week of the following full semester". Summer is not a full semester,
 *  so Spring and Summer courses both run against the first week of Fall.
 *  Mock term calendar: Spring starts mid-January, Fall starts mid-September. */
export function gradeChangeCutoff(semester: 'fall' | 'spring' | 'summer', year2: string): Date {
  const y = 2000 + (parseInt(year2, 10) || 0);
  return semester === 'fall'
    ? new Date(Date.UTC(y + 1, 0, 25)) // end of the first week of Spring
    : new Date(Date.UTC(y, 8, 22));    // end of the first week of Fall
}

export interface GradeChangeDeadlineInputs {
  semester: 'fall' | 'spring' | 'summer';
  year: string;
  justification: string;
}

/** True when an error-correction Change of Grade is filed past the form's
 *  deadline. The deadline only applies to the two error justifications; an
 *  Incomplete completion or an appeal-committee decision has no cutoff. */
export function isGradeChangeLate(input: GradeChangeDeadlineInputs, submittedAt: string | Date): boolean {
  if (input.justification !== 'data_entry_error' && input.justification !== 'computational_error') return false;
  return new Date(submittedAt).getTime() > gradeChangeCutoff(input.semester, input.year).getTime();
}

/** Final Grade of Incomplete CCK: the automatic-F rule printed on the form. */
export const CCK_INCOMPLETE_AUTO_F = {
  en: 'A course grade of "I" not changed by the course instructor by the end of the first two weeks of the following semester automatically changes to "F" and is calculated in the CGPA.',
  ar: 'درجة "غير مكتمل" التي لا يغيّرها مدرّس المادة بنهاية الأسبوعين الأولين من الفصل التالي تتحول تلقائياً إلى "F" وتُحتسب في المعدل التراكمي.',
};

/* ─── Credit Transfer Policy v2.0 (effective Spring 2025) ─── */

export interface CckTransferRule {
  key: string;
  label_en: string;
  label_ar: string;
}

/** Reviewer checklist mirrored from CCK Credit Transfer Policy v2.0 (and the
 *  private-university grade floor noted in CCK Hub Feedback v3). Each key maps
 *  to a `ruleKey` emitted by `validateTransferAttempt` so the UI can tie a
 *  flagged issue back to the rule it breaks. */
export const CCK_EQUIVALENCY_RULES: CckTransferRule[] = [
  {
    key: 'min_gpa_apply',
    label_en: 'Applicants must have a minimum cumulative GPA of 2.00 to apply for credit transfer (policy 4.2.9).',
    label_ar: 'يجب أن يكون المعدل التراكمي للمتقدم 2.00 على الأقل للتقدّم لتحويل الساعات (المادة 4.2.9).',
  },
  {
    key: 'content_70',
    label_en: 'Credit transfers only for courses at least 70% equivalent in content to a CCK course (policy 4.2.3).',
    label_ar: 'تُحوَّل المواد التي تتطابق بنسبة 70% على الأقل في المحتوى مع مقرر CCK (المادة 4.2.3).',
  },
  {
    key: 'seven_year_limit',
    label_en: 'Courses must have been taken within the last seven years; older courses need written VP for Academic Affairs approval (policy 4.2.2).',
    label_ar: 'يجب أن تكون المواد قد دُرست خلال السبع سنوات الأخيرة، وما قبلها يتطلب موافقة خطية من نائب الرئيس للشؤون الأكاديمية (المادة 4.2.2).',
  },
  {
    key: 'public_grade_min',
    label_en: 'Courses with a grade of C or above are eligible for transfer credit (public institutions / PAAET).',
    label_ar: 'يمكن تحويل المواد التي حصل فيها الطالب على درجة C فأعلى (المؤسسات الحكومية / الهيئة).',
  },
  {
    key: 'private_grade_min',
    label_en: 'For transfers from a private university, courses with a grade of C- or above are eligible (Feedback v3).',
    label_ar: 'يقبل تحويل المواد بدرجة -C فأعلى عند التحويل من جامعة خاصة (ملاحظات النسخة 3).',
  },
  {
    key: 'gpa_267_cap',
    label_en: 'PAAET graduates with GPA ≥ 2.67 may transfer up to 66 credits (Business) or 72 (Advanced Technology), with a minimum of 20 transferable credits (policy 4.3.1).',
    label_ar: 'خريجو الهيئة بمعدل 2.67 فأعلى يحوّلون حتى 66 ساعة (الأعمال) أو 72 ساعة (التكنولوجيا المتقدمة)، بحد أدنى 20 ساعة محوّلة (المادة 4.3.1).',
  },
  {
    key: 'paaet_below_267_cap',
    label_en: 'PAAET below 2.67 / non-graduates are capped at 39 credits (Business) or 42 (Advanced Technology) - 50% of the diploma (policy 4.3.2).',
    label_ar: 'الهيئة أقل من 2.67 أو غير المتخرجين: الحد الأقصى 39 ساعة (الأعمال) أو 42 ساعة (التكنولوجيا المتقدمة) - 50% من الدبلوم (المادة 4.3.2).',
  },
  {
    key: 'diploma_50_cap',
    label_en: 'Transfer students may transfer a maximum of 50% of the total diploma credits (policy 4.2.4).',
    label_ar: 'يجوز للطالب تحويل ما لا يزيد عن 50% من إجمالي ساعات الدبلوم (المادة 4.2.4).',
  },
  {
    key: 'remaining_12',
    label_en: 'PAAET advanced-standing students must complete a minimum of 12 credit hours at CCK (policy 4.3.1).',
    label_ar: 'طلبة التحويل التميّزي من الهيئة يجب أن يكملوا 12 ساعة على الأقل في CCK (المادة 4.3.1).',
  },
  {
    key: 'census_timing',
    label_en: 'Exemptions must be requested before the start of the semester up to the Census date; later requests are processed the next term (policy 4.2.6/4.2.7).',
    label_ar: 'تُطلب الإعفاءات قبل بدء الفصل وحتى تاريخ الإحصاء، وما بعده يُعالَج في الفصل التالي (المادة 4.2.6/4.2.7).',
  },
];

export type TransferIssueSeverity = 'block' | 'info';

/** Validate a transfer attempt against CCK Credit Transfer Policy v2.0. */
export interface TransferValidationInput {
  /** Source institution category. */
  source: 'paaet' | 'public' | 'private';
  /** Source-institution cumulative GPA, when known (gate for policy 4.2.9 + 4.3.1). */
  sourceGpa?: number;
  /** Credit hours the reviewer is attempting to transfer. */
  transferCredits: number;
  /** Total credit hours of the target CCK program. */
  programCredits: number;
  /** School the program sits under - caps differ for Business vs Advanced Tech. */
  programSchool?: 'business' | 'advanced_tech';
  /** Lowest letter grade across the courses being transferred (e.g. "C", "C-"). */
  lowestGrade?: string;
  /** Any course was completed more than seven years ago (policy 4.2.2). */
  hasCoursesOverSevenYears?: boolean;
  /** VP for Academic Affairs granted a written exception to the seven-year limit. */
  vpaTimeException?: boolean;
  /** Request is being filed after the Census date (policy 4.2.6/4.2.7). */
  afterCensusDate?: boolean;
}

export interface TransferValidationIssue {
  ruleKey: string;
  severity: TransferIssueSeverity;
  message_en: string;
  message_ar: string;
}

const GRADE_ORDER: Record<string, number> = {
  'A+': 13, 'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
  'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'F': 0,
};

/** Lowest letter grade in a list (ignores blanks / unrecognised grades). */
export function lowestGradeOf(grades: string[]): string | undefined {
  const known = grades
    .map((g) => g.trim().toUpperCase())
    .filter((g) => GRADE_ORDER[g] !== undefined);
  if (known.length === 0) return undefined;
  return known.reduce((lo, g) => (GRADE_ORDER[g] < GRADE_ORDER[lo] ? g : lo));
}

export function validateTransferAttempt(input: TransferValidationInput): TransferValidationIssue[] {
  const issues: TransferValidationIssue[] = [];
  const remaining = input.programCredits - input.transferCredits;

  // 4.2.9 - minimum cumulative GPA of 2.00 to apply.
  if (input.sourceGpa !== undefined && input.sourceGpa < 2.0) {
    issues.push({
      ruleKey: 'min_gpa_apply',
      severity: 'block',
      message_en: `Applicant cumulative GPA ${input.sourceGpa.toFixed(2)} is below the 2.00 minimum required to apply (policy 4.2.9).`,
      message_ar: `المعدل التراكمي للمتقدم ${input.sourceGpa.toFixed(2)} أقل من الحد الأدنى 2.00 المطلوب للتقدّم (المادة 4.2.9).`,
    });
  }

  // 4.3.x + Feedback v3 - grade minimums (C, or C- for private universities).
  if (input.lowestGrade && GRADE_ORDER[input.lowestGrade] !== undefined) {
    const min = input.source === 'private' ? GRADE_ORDER['C-'] : GRADE_ORDER['C'];
    if (GRADE_ORDER[input.lowestGrade] < min) {
      issues.push({
        ruleKey: input.source === 'private' ? 'private_grade_min' : 'public_grade_min',
        severity: 'block',
        message_en: input.source === 'private'
          ? `Lowest grade ${input.lowestGrade} is below C- - private-university transfers require C- or higher.`
          : `Lowest grade ${input.lowestGrade} is below C - transfers require C or higher.`,
        message_ar: input.source === 'private'
          ? `أدنى درجة ${input.lowestGrade} أقل من -C - التحويل من الجامعات الخاصة يتطلب -C فأعلى.`
          : `أدنى درجة ${input.lowestGrade} أقل من C - التحويل يتطلب C فأعلى.`,
      });
    }
  }

  // 4.2.2 - seven-year recency (VPA may grant a written exception).
  if (input.hasCoursesOverSevenYears && !input.vpaTimeException) {
    issues.push({
      ruleKey: 'seven_year_limit',
      severity: 'block',
      message_en: 'One or more courses were completed more than seven years ago; written VP for Academic Affairs approval is required (policy 4.2.2).',
      message_ar: 'دُرست مادة أو أكثر قبل أكثر من سبع سنوات؛ يلزم موافقة خطية من نائب الرئيس للشؤون الأكاديمية (المادة 4.2.2).',
    });
  }

  if (input.source === 'paaet') {
    if ((input.sourceGpa ?? 0) >= 2.67) {
      // 4.3.1 - PAAET advanced standing.
      const cap = input.programSchool === 'advanced_tech' ? 72 : 66;
      if (input.transferCredits > cap) {
        issues.push({
          ruleKey: 'gpa_267_cap',
          severity: 'block',
          message_en: `PAAET advanced-standing cap of ${cap} credits exceeded (requested ${input.transferCredits}).`,
          message_ar: `تم تجاوز الحد الأقصى للساعات المحوّلة من الهيئة (${cap})، المطلوب ${input.transferCredits}.`,
        });
      }
      if (input.transferCredits > 0 && input.transferCredits < 20) {
        issues.push({
          ruleKey: 'gpa_267_cap',
          severity: 'block',
          message_en: `PAAET advanced standing requires a minimum of 20 transferable credit hours (only ${input.transferCredits} mapped).`,
          message_ar: `يتطلب التحويل التميّزي من الهيئة 20 ساعة محوّلة على الأقل (تم ربط ${input.transferCredits} فقط).`,
        });
      }
      // 4.3.1 - minimum 12 credits completed at CCK (advanced-standing only).
      if (input.programCredits > 0 && remaining < 12) {
        issues.push({
          ruleKey: 'remaining_12',
          severity: 'block',
          message_en: `Student must complete at least 12 credit hours at CCK; only ${remaining} would remain.`,
          message_ar: `يجب على الطالب إكمال 12 ساعة على الأقل في CCK، وسيتبقى ${remaining} ساعة فقط.`,
        });
      }
    } else {
      // 4.3.2 - PAAET below 2.67 / non-graduates: 50% diploma cap.
      const cap = input.programSchool === 'advanced_tech' ? 42 : 39;
      if (input.transferCredits > cap) {
        issues.push({
          ruleKey: 'paaet_below_267_cap',
          severity: 'block',
          message_en: `Without GPA ≥ 2.67, PAAET transfer is capped at ${cap} credits / 50% of the diploma (requested ${input.transferCredits}).`,
          message_ar: `بدون معدل 2.67 من الهيئة، الحد الأقصى للتحويل ${cap} ساعة / 50% من الدبلوم (المطلوب ${input.transferCredits}).`,
        });
      }
    }
  } else if (input.programCredits > 0 && input.transferCredits > input.programCredits * 0.5) {
    // 4.2.4 - general diploma 50% cap for non-PAAET sources.
    issues.push({
      ruleKey: 'diploma_50_cap',
      severity: 'block',
      message_en: `Transfer of ${input.transferCredits} credits exceeds 50% of the ${input.programCredits}-credit diploma program (policy 4.2.4).`,
      message_ar: `تحويل ${input.transferCredits} ساعة يتجاوز 50% من برنامج الدبلوم البالغ ${input.programCredits} ساعة (المادة 4.2.4).`,
    });
  }

  // 4.2.6 / 4.2.7 - Census-date timing (informational, not blocking).
  if (input.afterCensusDate) {
    issues.push({
      ruleKey: 'census_timing',
      severity: 'info',
      message_en: 'Filed after the Census date - the request will be processed for the next term (policy 4.2.7).',
      message_ar: 'قُدّم بعد تاريخ الإحصاء - ستُعالَج الطلب في الفصل التالي (المادة 4.2.7).',
    });
  }

  return issues;
}

/* ─── Credit-equivalence floor (Equivalency Screen Feedback) ─── */

/** A single CCK course mapping with the prior credit hours being transferred
 *  into it. For combined mappings (2+ prior courses → 1 CCK course), pass the
 *  summed prior credit. */
export interface CreditEquivalenceMapping {
  /** CCK course code, for the message (e.g. "MGT2224"). */
  cckCode: string;
  /** CCK course title, for the message. */
  cckTitle: string;
  /** Credit hours of the CCK course. */
  cckCredit: number;
  /** Prior (PAAET / source) credit hours mapped to this CCK course. */
  priorCredit: number;
}

/**
 * Credit-floor rule from the Equivalency Screen Feedback: the prior credit must
 * always be equal to or higher than the CCK course credit, with a single
 * exception allowing it to be exactly one hour less. Anything two or more hours
 * below the CCK course credit blocks approval.
 */
export function validateCreditEquivalence(
  mappings: CreditEquivalenceMapping[],
): TransferValidationIssue[] {
  const issues: TransferValidationIssue[] = [];
  for (const m of mappings) {
    // Only meaningful once both credits are known (> 0).
    if (!(m.cckCredit > 0) || !(m.priorCredit > 0)) continue;
    if (m.priorCredit < m.cckCredit - 1) {
      const label = m.cckCode && m.cckCode !== '-' ? `${m.cckCode} - ${m.cckTitle}` : m.cckTitle;
      issues.push({
        ruleKey: 'credit_floor',
        severity: 'block',
        message_en: `Prior credit ${m.priorCredit} for ${label} is more than one hour below the CCK course credit ${m.cckCredit}; transfer credit must equal the CCK credit or be at most one hour less.`,
        message_ar: `الساعات السابقة ${m.priorCredit} للمقرر ${label} أقل بأكثر من ساعة واحدة من ساعات مقرر CCK البالغة ${m.cckCredit}؛ يجب أن تساوي الساعات المحوّلة ساعات مقرر CCK أو تقل عنها بساعة واحدة كحد أقصى.`,
      });
    }
  }
  return issues;
}

export interface CckTransferPolicySection {
  number: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
}

/** Structured CCK Credit Transfer Policy v2.0 - surfaced in Settings → Policies. */
export const CCK_TRANSFER_POLICY = {
  version: '2.0',
  approved_by: 'BOT, GMs & VPA',
  approved_at: 'March 2025',
  effective: 'Spring 2025',
  sections: [
    {
      number: '4.2.2',
      title_en: 'Seven-year recency limit',
      title_ar: 'حد السبع سنوات',
      body_en: 'Transferable courses may have been taken in the last seven years. Any exception requires written approval from the VP for Academic Affairs.',
      body_ar: 'يجوز تحويل المواد المدروسة خلال السبع سنوات الأخيرة، وأي استثناء يتطلب موافقة خطية من نائب الرئيس للشؤون الأكاديمية.',
    },
    {
      number: '4.2.3',
      title_en: 'Content equivalence threshold',
      title_ar: 'حد التطابق في المحتوى',
      body_en: 'Credit is transferred for courses found to be at least 70% equivalent in content to a CCK course.',
      body_ar: 'تُحوَّل الساعات للمقررات التي تتطابق في محتواها مع مقرر CCK بنسبة 70% على الأقل.',
    },
    {
      number: '4.2.4',
      title_en: 'Diploma 50% cap',
      title_ar: 'الحد الأقصى 50% للدبلوم',
      body_en: 'Transfer students may transfer a maximum of 50% of the total credits toward the Diploma.',
      body_ar: 'يجوز للطالب تحويل ما لا يزيد عن 50% من إجمالي ساعات الدبلوم.',
    },
    {
      number: '4.2.5',
      title_en: 'CR designation - GPA neutral',
      title_ar: 'رمز CR - لا يؤثر على المعدل',
      body_en: 'Transferred credits appear as "CR" on the transcript and do not contribute to the GPA.',
      body_ar: 'تظهر الساعات المحوّلة بالرمز "CR" في كشف الدرجات ولا تدخل في حساب المعدل.',
    },
    {
      number: '4.2.6 / 4.2.7',
      title_en: 'Census-date timing',
      title_ar: 'توقيت تاريخ الإحصاء',
      body_en: 'Exemptions must be requested before the start of the semester up to the Census date. Requests filed after the Census date are processed for the next term.',
      body_ar: 'تُطلب الإعفاءات قبل بدء الفصل وحتى تاريخ الإحصاء، وتُعالَج الطلبات المقدَّمة بعد تاريخ الإحصاء في الفصل التالي.',
    },
    {
      number: '4.2.9',
      title_en: 'Minimum GPA to apply',
      title_ar: 'الحد الأدنى للمعدل للتقديم',
      body_en: 'Transfer applicants must have a minimum cumulative GPA of 2.00 to apply.',
      body_ar: 'يجب أن يكون المعدل التراكمي للمتقدم 2.00 على الأقل للتقدّم لتحويل الساعات.',
    },
    {
      number: '4.3.1',
      title_en: 'PAAET advanced standing (GPA ≥ 2.67)',
      title_ar: 'التحويل التميّزي من الهيئة (معدل 2.67)',
      body_en: 'PAAET graduates with cumulative GPA ≥ 2.67 may transfer up to 66 credit hours (Business) or 72 (Advanced Technology). Minimum 20 credits transferable; no transferred course below grade C.',
      body_ar: 'خريجو الهيئة بمعدل 2.67 فأعلى يحوّلون حتى 66 ساعة (الأعمال) أو 72 ساعة (التكنولوجيا المتقدمة)، بحد أدنى 20 ساعة محوّلة وبدون درجة أقل من C.',
    },
    {
      number: '4.3.2',
      title_en: 'PAAET below 2.67 / non-graduates',
      title_ar: 'الهيئة أقل من 2.67 / غير المتخرجين',
      body_en: 'Capped at 39 credits (Business, 50% of diploma) or 42 credits (Advanced Technology). Courses with grade C or above only.',
      body_ar: 'الحد الأقصى 39 ساعة (الأعمال، 50% من الدبلوم) أو 42 ساعة (التكنولوجيا المتقدمة)، وبدرجة C فأعلى فقط.',
    },
    {
      number: '5',
      title_en: 'Required documents',
      title_ar: 'المستندات المطلوبة',
      body_en: 'Completed CCK Application Form + Completed Credit Transfer Form + Sealed Original Transcript + Course Outlines.',
      body_ar: 'نموذج التقديم لـ CCK + نموذج تحويل الساعات + كشف درجات أصلي مختوم + توصيف المقررات.',
    },
    {
      number: '6',
      title_en: 'Responsibilities',
      title_ar: 'المسؤوليات',
      body_en: 'The applicant submits all documents on time and pays the required fees. Incomplete applications are not accepted. Credit transfers do not affect the GPA. A student granted credit may opt to take the course as normal by informing the College in the first week of the semester.',
      body_ar: 'يقدّم المتقدم جميع المستندات في موعدها ويدفع الرسوم المطلوبة. لا تُقبل الطلبات غير المكتملة. لا تؤثر الساعات المحوّلة على المعدل. ويجوز للطالب الذي مُنح إعفاءً أن يختار دراسة المادة بشكل عادي بإبلاغ الكلية في الأسبوع الأول من الفصل.',
    },
  ] satisfies CckTransferPolicySection[],
};

/* ─── Grading System Policy v2.0 (effective Fall 2025/2026) ─── */

export interface GradeRow {
  letter: string;
  description_en: string;
  description_ar: string;
  score: number;
  scoreRange: string;
}

export const CCK_GRADING_SCHEME: GradeRow[] = [
  { letter: 'A',  description_en: '95–100', description_ar: '100–95', score: 4.00, scoreRange: '95-100' },
  { letter: 'A-', description_en: '90–94',  description_ar: '94–90',  score: 3.67, scoreRange: '90-94' },
  { letter: 'B+', description_en: '86–89',  description_ar: '89–86',  score: 3.33, scoreRange: '86-89' },
  { letter: 'B',  description_en: '83–85',  description_ar: '85–83',  score: 3.00, scoreRange: '83-85' },
  { letter: 'B-', description_en: '80–82',  description_ar: '82–80',  score: 2.67, scoreRange: '80-82' },
  { letter: 'C+', description_en: '75–79',  description_ar: '79–75',  score: 2.33, scoreRange: '75-79' },
  { letter: 'C',  description_en: '70–74',  description_ar: '74–70',  score: 2.00, scoreRange: '70-74' },
  { letter: 'C-', description_en: '66–69',  description_ar: '69–66',  score: 1.67, scoreRange: '66-69' },
  { letter: 'D+', description_en: '63–65',  description_ar: '65–63',  score: 1.33, scoreRange: '63-65' },
  { letter: 'D',  description_en: '60–62',  description_ar: '62–60',  score: 1.00, scoreRange: '60-62' },
  { letter: 'F',  description_en: 'Below 60', description_ar: 'أقل من 60', score: 0,    scoreRange: '<60' },
  { letter: 'FA', description_en: 'Failure of Absence', description_ar: 'رسوب بالغياب', score: 0, scoreRange: 'FA' },
];

export interface AcademicStandingRow {
  classification_en: string;
  classification_ar: string;
  range_en: string;
  rangeMin: number;
  rangeMax: number | null;
}

export const CCK_ACADEMIC_STANDING: AcademicStandingRow[] = [
  { classification_en: 'Satisfactory',                classification_ar: 'مقبول',                       range_en: '2.00 ≤ GPA ≤ 2.32', rangeMin: 2.00, rangeMax: 2.32 },
  { classification_en: 'Average',                     classification_ar: 'جيد',                          range_en: '2.33 ≤ GPA ≤ 2.66', rangeMin: 2.33, rangeMax: 2.66 },
  { classification_en: 'Above Average',               classification_ar: 'جيد مرتفع',                   range_en: '2.67 ≤ GPA ≤ 2.99', rangeMin: 2.67, rangeMax: 2.99 },
  { classification_en: 'Good',                        classification_ar: 'جيد جدًا',                     range_en: '3.00 ≤ GPA ≤ 3.32', rangeMin: 3.00, rangeMax: 3.32 },
  { classification_en: 'Very Good',                   classification_ar: 'جيد جدًا مرتفع',              range_en: '3.33 ≤ GPA ≤ 3.66', rangeMin: 3.33, rangeMax: 3.66 },
  { classification_en: 'Excellent',                   classification_ar: 'امتياز',                       range_en: '3.67 ≤ GPA ≤ 3.84', rangeMin: 3.67, rangeMax: 3.84 },
  { classification_en: 'Excellent (with honor)',      classification_ar: 'امتياز (مع مرتبة الشرف)',     range_en: '3.85 ≤ GPA ≤ 3.94', rangeMin: 3.85, rangeMax: 3.94 },
  { classification_en: 'Excellent (with high honor)', classification_ar: 'امتياز (مع مرتبة الشرف العليا)', range_en: 'GPA ≥ 3.95',       rangeMin: 3.95, rangeMax: null },
];

export const CCK_GRADING_POLICY = {
  version: '2.0',
  approved_by: 'BOT, GMs & VPA',
  approved_at: 'July 2025',
  effective: 'Fall 2025/2026',
  passThresholdPct: 60,
  minGraduationGpa: 2.00,
  censusDay: 21,
  repeatThresholdLetter: 'C-',
  notes_en: [
    'Credit Transfers (CT) are not included in GPA computation.',
    'GPA is calculated separately for Diploma and Bachelor programs; summer counts only if studied at CCK.',
    'GPAs are not calculated for the English Language Program.',
    'A pass requires grade D or higher (60% / 60%).',
    'FSP (Failure with Supplemental Privilege) auto-converts to F after 4 months unless extended by the Registrar.',
    'Repeated course: previous grade is replaced in the cumulative GPA; second+ repeats include all attempts.',
    'Incomplete (I) auto-converts to F if work not finished within the calendar window.',
    'A Change of Final Grade requires Academic Chair + VPA signature; grades cannot change after qualification.',
  ],
  notes_ar: [
    'لا تدخل الساعات المحوّلة (CT) في حساب المعدل.',
    'يُحسب المعدل بشكل منفصل للدبلوم والبكالوريوس، ولا يُدخل الصيف إلا إذا درس الطالب في CCK.',
    'لا يُحسب المعدل لبرنامج اللغة الإنجليزية.',
    'النجاح يتطلب درجة D فأعلى (60% / 60%).',
    'تتحوّل علامة FSP إلى F بعد 4 أشهر ما لم يمنح المسجّل تمديداً.',
    'إعادة المادة: تستبدل الدرجة السابقة في المعدل التراكمي؛ الإعادة الثانية فما فوق تُحتسب كل المحاولات.',
    'تتحوّل علامة "غير مكتمل" (I) إلى F إذا لم تُستكمل الأعمال في النافذة الزمنية.',
    'تتطلب موافقة رئيس القسم ونائب الرئيس للشؤون الأكاديمية لتغيير الدرجة النهائية؛ ولا تتغيّر بعد منح الشهادة.',
  ],
};

/* ─── Critical Cases (CCK Hub Feedback v3) ─── */

export interface CriticalCaseCondition {
  key: string;
  text_en: string;
  text_ar: string;
}

export const CRITICAL_CASES_CONDITIONS: CriticalCaseCondition[] = [
  { key: 'all_below_200',
    text_en: 'Any student with CGPA below 2.00.',
    text_ar: 'أي طالب بمعدل تراكمي أقل من 2.00.' },
  { key: 'kw_diploma',
    text_en: 'Kuwaiti Diploma student - GPA below 2.50, age below 23, and completed/enrolled in up to 15 credits.',
    text_ar: 'طالب دبلوم كويتي - معدل أقل من 2.50، عمر أقل من 23، ومسجل/أنهى ما يصل إلى 15 ساعة.' },
  { key: 'kw_ba',
    text_en: 'Kuwaiti Bachelor student - age below 27, CGPA below 3.00 with ≤15 credits, or CGPA 2.00–2.51 after 30 credits.',
    text_ar: 'طالب بكالوريوس كويتي - عمر أقل من 27، معدل أقل من 3.00 مع 15 ساعة أو أقل، أو معدل 2.00–2.51 بعد 30 ساعة.' },
  { key: 'kw_grad',
    text_en: 'Expected-to-graduate Kuwaiti student with 24 credits remaining in Diploma and age below 27.',
    text_ar: 'طالب كويتي متوقع التخرج لديه 24 ساعة متبقية في الدبلوم وعمره أقل من 27.' },
];

/* ─── Academic Warning Policy (thresholds + progression) ─── */

export interface AcademicWarningRow {
  /** Minimum cumulative GPA needed for the credit-hour band. */
  minGpa: number;
  diplomaCredits: string;
  bachelorCredits: string;
}

export const ACADEMIC_WARNING_THRESHOLDS: AcademicWarningRow[] = [
  { minGpa: 1.30, diplomaCredits: '0–20', bachelorCredits: '0–16' },
  { minGpa: 1.55, diplomaCredits: '21–42', bachelorCredits: '17–28' },
  { minGpa: 1.80, diplomaCredits: '43–62', bachelorCredits: '29–40' },
  { minGpa: 2.00, diplomaCredits: '63+',   bachelorCredits: '41+' },
];

export type ProgressionStatus =
  | 'good_standing' | 'first_warning' | 'second_warning'
  | 'probation' | 'final_probation' | 'suspension' | 'dismissal';

export interface ProgressionStateInfo {
  status: ProgressionStatus;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
}

/** Academic Progression Policy flow taken from the CCK Hub Feedback v3 diagram. */
export const ACADEMIC_PROGRESSION_FLOW: ProgressionStateInfo[] = [
  { status: 'good_standing',
    label_en: 'Good Standing', label_ar: 'وضع سليم',
    description_en: 'CGPA above the dismissal standard. No restrictions.',
    description_ar: 'المعدل أعلى من معيار الفصل. لا قيود.' },
  { status: 'first_warning',
    label_en: '1st Warning', label_ar: 'الإنذار الأول',
    description_en: 'CGPA below DS for the first time - advising required.',
    description_ar: 'المعدل تحت معيار الفصل لأول مرة - يجب الإرشاد الأكاديمي.' },
  { status: 'second_warning',
    label_en: '2nd Warning', label_ar: 'الإنذار الثاني',
    description_en: 'CGPA below DS for a second consecutive semester.',
    description_ar: 'المعدل تحت معيار الفصل لفصل ثانٍ متتالٍ.' },
  { status: 'probation',
    label_en: 'Probation', label_ar: 'تحت المراقبة',
    description_en: 'Course load may be capped while the student raises CGPA.',
    description_ar: 'قد يُحدَّد العبء الدراسي حتى يرفع الطالب المعدل.' },
  { status: 'final_probation',
    label_en: 'Final Probation', label_ar: 'مراقبة نهائية',
    description_en: 'CGPA still below DS and semester GPA ≥ 2.00 - final chance.',
    description_ar: 'المعدل لا يزال تحت المعيار ومعدل الفصل 2.00 فأعلى - الفرصة الأخيرة.' },
  { status: 'suspension',
    label_en: 'Academic Suspension', label_ar: 'إيقاف أكاديمي',
    description_en: 'One-semester suspension when student remains under DS and semester GPA < 2.00.',
    description_ar: 'إيقاف فصل واحد إذا بقي الطالب تحت المعيار ومعدل الفصل أقل من 2.00.' },
  { status: 'dismissal',
    label_en: 'Academic Dismissal', label_ar: 'فصل أكاديمي',
    description_en: 'CGPA remains below DS after suspension.',
    description_ar: 'المعدل لا يزال تحت المعيار بعد الإيقاف.' },
];

/* ─── FA Stage warnings (Warn 1 / Warn 2 / Forcing Withdraw) ─── */

export type FaWarningStage = 'first_warning' | 'second_warning' | 'forcing_withdraw';

export interface FaWarningStageInfo {
  stage: FaWarningStage;
  rowColor: 'green' | 'yellow' | 'red';
  label_en: string;
  label_ar: string;
  email_subject_en: string;
  email_subject_ar: string;
  body_en: string;
  body_ar: string;
}

/** Pre-canned per-stage warning email content for the FA screen. */
export const FA_WARNING_STAGES: FaWarningStageInfo[] = [
  {
    stage: 'first_warning',
    rowColor: 'green',
    label_en: 'Absence Warning 1',
    label_ar: 'إنذار الغياب الأول',
    email_subject_en: 'CCK Attendance - 1st absence warning',
    email_subject_ar: 'الحضور في CCK - إنذار الغياب الأول',
    body_en: 'Your absences have reached the first warning threshold. Please attend remaining classes and meet your advisor within one week.',
    body_ar: 'وصل غيابك إلى حد الإنذار الأول. يرجى حضور بقية المحاضرات ومقابلة المرشد الأكاديمي خلال أسبوع.',
  },
  {
    stage: 'second_warning',
    rowColor: 'yellow',
    label_en: 'Absence Warning 2',
    label_ar: 'إنذار الغياب الثاني',
    email_subject_en: 'CCK Attendance - 2nd absence warning (advising required)',
    email_subject_ar: 'الحضور في CCK - إنذار الغياب الثاني (الإرشاد مطلوب)',
    body_en: 'You have reached the second absence warning. An "Absence 2nd Warning" advising appointment will be auto-scheduled.',
    body_ar: 'وصلت إلى الإنذار الثاني للغياب. سيتم تلقائياً جدولة موعد إرشاد "إنذار الغياب الثاني".',
  },
  {
    stage: 'forcing_withdraw',
    rowColor: 'red',
    label_en: 'Forcing Withdraw',
    label_ar: 'إجبار الانسحاب',
    email_subject_en: 'CCK Attendance - Forced withdrawal notice',
    email_subject_ar: 'الحضور في CCK - إشعار الانسحاب الإجباري',
    body_en: 'Your absences exceed the FA limit. You will be withdrawn from the course and an FA grade recorded.',
    body_ar: 'تجاوز غيابك حد الرسوب بالغياب. ستُسحب من المادة وتُرصد علامة FA.',
  },
];

/* ─── Advising Meeting Types (Calendar) ─── */

export interface AdvisingMeetingType {
  key: string;
  label_en: string;
  label_ar: string;
  triggered_by_en: string;
  triggered_by_ar: string;
}

export const ADVISING_MEETING_TYPES: AdvisingMeetingType[] = [
  {
    key: 'gpa_warning',
    label_en: 'GPA Warning Appointment',
    label_ar: 'موعد الإنذار الأكاديمي',
    triggered_by_en: 'Auto-scheduled when a student receives an academic warning.',
    triggered_by_ar: 'يُجدول تلقائياً عند صدور إنذار أكاديمي للطالب.',
  },
  {
    key: 'absence_2nd_warning',
    label_en: 'Absence 2nd Warning Appointment',
    label_ar: 'موعد الإنذار الثاني للغياب',
    triggered_by_en: 'Auto-scheduled when the FA screen records a 2nd absence warning.',
    triggered_by_ar: 'يُجدول تلقائياً عند تسجيل إنذار الغياب الثاني في شاشة FA.',
  },
];

/* ─── Social Allowance document lists (per category × stage) ─── */

export type SocialAllowanceStage = 'expected_grad' | 'newly_admitted';
export type SocialAllowanceCategory =
  | 'kuwaiti' | 'kuwaiti_mother' | 'special_needs' | 'married';

export interface SocialAllowanceCategoryDocs {
  category: SocialAllowanceCategory;
  /** Ordered document keys (match `social.docs.*` translation keys). */
  documents: string[];
}

export interface SocialAllowanceStageGroup {
  stage: SocialAllowanceStage;
  categories: SocialAllowanceCategoryDocs[];
}

/** Document order copied verbatim from the CCK Hub Feedback v3 - Social
 *  Allowance section. The keys map to translations under `social.docs.*`. */
export const SOCIAL_ALLOWANCE_CHECKLISTS: SocialAllowanceStageGroup[] = [
  {
    stage: 'expected_grad',
    categories: [
      { category: 'kuwaiti', documents: [
        'civil_id', 'twimc', 'security', 'social_affairs', 'puc_payment_lookup', 'twimc_2',
      ] },
      { category: 'kuwaiti_mother', documents: [
        'civil_id_security', 'manpower', 'social_affairs', 'mother_nationality',
        'mother_civil_id', 'birth_cert', 'twimc_mother', 'puc_payment_lookup', 'twimc_2',
      ] },
      { category: 'special_needs', documents: [
        'civil_id', 'twimc', 'security', 'social_affairs',
        'puc_payment_lookup', 'twimc_2', 'padp_letter',
      ] },
      { category: 'married', documents: [
        'civil_id', 'twimc', 'security', 'social_affairs',
        'puc_payment_lookup', 'twimc_2',
        'marriage_cert', 'marriage_continuity', 'wife_civil_id',
      ] },
    ],
  },
  {
    stage: 'newly_admitted',
    categories: [
      { category: 'kuwaiti', documents: [
        'form_social_allowance', 'civil_id', 'social_affairs', 'security',
        'salary_transfer', 'schedule_sis', 'puc_payment_lookup',
      ] },
      { category: 'kuwaiti_mother', documents: [
        'form_social_allowance', 'civil_id_security', 'social_affairs', 'manpower',
        'salary_transfer', 'schedule_sis', 'mother_civil_id', 'mother_nationality',
        'twimc_mother', 'birth_cert', 'puc_payment_lookup',
      ] },
      // Special Needs + Married carry the same baseline as Expected to Graduate,
      // plus the universal Form For Social Allowance for newly admitted intake.
      { category: 'special_needs', documents: [
        'form_social_allowance', 'civil_id', 'twimc', 'security',
        'social_affairs', 'puc_payment_lookup', 'twimc_2', 'padp_letter',
      ] },
      { category: 'married', documents: [
        'form_social_allowance', 'civil_id', 'twimc', 'security',
        'social_affairs', 'puc_payment_lookup', 'twimc_2',
        'marriage_cert', 'marriage_continuity', 'wife_civil_id',
      ] },
    ],
  },
];
