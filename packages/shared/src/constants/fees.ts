// CCK fee schedule, withdrawal fines, and installment rules.
// Sources: "CCK Registration & other fees, finance withdraw policy.pdf",
// "Finance Department.docx/.pdf", "Course Installment Details.xlsx".
// All amounts are in Kuwaiti Dinar (KWD).

import type { PaymentMethod } from '../types/payment';

export const CURRENCY = 'KWD';

// ---------------------------------------------------------------------------
// Tuition — priced per credit hour, varies by program track.
// ---------------------------------------------------------------------------

export type ProgramTrack = 'diploma' | 'foundation' | 'bba_business' | 'basc_computer';

/** Price per credit hour, before any grant/discount. */
export const CREDIT_PRICE_KWD: Record<Exclude<ProgramTrack, 'foundation'>, number> = {
  diploma: 100,
  bba_business: 262.5, // BBA Accounting / Management / Marketing
  basc_computer: 280, // BASc Computer Science
};

/** Foundation is billed as a flat semester fee, not per credit. */
export const FOUNDATION_SEMESTER_FEE_KWD = 1950;

/** Standard CCK grant — the published "unit price after grant" (100 → 65 KWD). */
export const STANDARD_GRANT_RATE = 0.35;

/** Discount for recognised sport students (see Student Life policy). */
export const SPORT_DISCOUNT_RATE = 0.4;

/** Flat per-semester student service fee, added on top of tuition. */
export const STUDENT_SERVICE_FEE_KWD = 25;

/** Course/seat registration fee, paid up front at registration time. */
export const REGISTRATION_FEE_KWD: Record<'diploma' | 'foundation' | 'bachelor', number> = {
  diploma: 550,
  foundation: 550, // "Seat & Course registration fees"
  bachelor: 600,
};

/** Seat reservation deposit a self-funded applicant pays to unlock their
 *  acceptance letter (CCK Hub Update 17-06-26). Non-refundable. */
export const SEAT_RESERVATION_FEE_KWD = 150;

// ---------------------------------------------------------------------------
// One-time / per-request fees — all non-refundable.
// ---------------------------------------------------------------------------

export const MISC_FEES_KWD = {
  /** One-time PUC admission application fee (CCK Hub Update 17-06-26). */
  application: 10,
  /** Late registration fee — shown to students from the 1st day of the
   *  semester and must be paid to proceed with registration. */
  late_registration: 5,
  re_admission: 10,
  /** Replacement or extra student ID card. */
  id_replacement: 5,
  /** Official transcript, per copy. */
  official_transcript: 5,
  /** "To Whom It May Concern" letter, per letter (new students: after week 5). */
  twimc_letter: 2,
  /** Diploma re-issuance, per diploma. */
  diploma_reissuance: 10,
  /** Placement test, per test (5 tests available). */
  placement_test: 5,
  graduation_gown: 25,
} as const;

export type MiscFeeType = keyof typeof MISC_FEES_KWD;

export const NON_REFUNDABLE_FEES: MiscFeeType[] = Object.keys(MISC_FEES_KWD) as MiscFeeType[];

// ---------------------------------------------------------------------------
// Withdrawal fines — a percentage of total tuition, by the study week in
// which the student withdraws from a course / semester / the college.
// ---------------------------------------------------------------------------

export const WITHDRAWAL_FINE_BY_WEEK: Record<number, number> = {
  2: 0.25,
  3: 0.5,
  4: 0.75,
  5: 1.0,
};

/** Fine rate for a withdrawal in a given study week. Week 1 is free; week 5+
 *  forfeits the full tuition. */
export function withdrawalFineRate(studyWeek: number): number {
  if (studyWeek <= 1) return 0;
  if (studyWeek >= 5) return 1;
  return WITHDRAWAL_FINE_BY_WEEK[studyWeek] ?? 0;
}

/** KWD fine owed when withdrawing in `studyWeek` against a tuition total. */
export function calcWithdrawalFine(totalTuition: number, studyWeek: number): number {
  return round2(totalTuition * withdrawalFineRate(studyWeek));
}

// ---------------------------------------------------------------------------
// Installment schedule — the payable balance (after the up-front registration
// fee) is split across three installments due in weeks 4, 8 and 12.
// ---------------------------------------------------------------------------

export const INSTALLMENT_WEEKS = [4, 8, 12] as const;

// Course Installment Details.xlsx splits the balance 50% / 25% / 25% in four of
// five worked examples (the "Bachelor computer" sheet used equal thirds — treat
// that as a source inconsistency until Finance confirms).
export const INSTALLMENT_SPLIT = [0.5, 0.25, 0.25] as const;

export interface Installment {
  /** 1-based installment number. */
  number: number;
  /** Study week the installment is due. */
  week: number;
  amount: number;
}

/** Split a payable balance into the three CCK installments. */
export function buildInstallments(balance: number): Installment[] {
  return INSTALLMENT_WEEKS.map((week, i) => ({
    number: i + 1,
    week,
    amount: round2(balance * INSTALLMENT_SPLIT[i]),
  }));
}

// ---------------------------------------------------------------------------
// Tuition breakdown — the full per-semester calculation.
// ---------------------------------------------------------------------------

/** Payment modes CCK Finance accepts (Finance Department.docx). A subset of
 *  the platform-wide PaymentMethod union. */
export const CCK_PAYMENT_METHODS: PaymentMethod[] = ['knet', 'visa', 'mastercard', 'cash'];

export interface TuitionBreakdown {
  credits: number;
  creditPrice: number;
  grossTuition: number;
  discountRate: number;
  discountAmount: number;
  netTuition: number;
  serviceFee: number;
  registrationFee: number;
  /** Everything owed for the semester (net tuition + service + registration). */
  totalPayable: number;
  /** Balance left to pay after the up-front registration fee. */
  installmentBalance: number;
  installments: Installment[];
}

/** Compute a full semester tuition breakdown for a student.
 *  `discountRate` is the student's grant/discount (0 = none, 0.35 = standard
 *  grant, 0.40 = sport). Repeated courses are not discount-eligible for
 *  self-funded students — pass 0 for those credits. */
export function calcTuition(opts: {
  credits: number;
  track: ProgramTrack;
  level: 'diploma' | 'foundation' | 'bachelor';
  discountRate?: number;
}): TuitionBreakdown {
  const { credits, track, level } = opts;
  const discountRate = opts.discountRate ?? 0;

  const grossTuition =
    track === 'foundation'
      ? FOUNDATION_SEMESTER_FEE_KWD
      : credits * CREDIT_PRICE_KWD[track];
  const creditPrice = track === 'foundation' ? 0 : CREDIT_PRICE_KWD[track];

  const discountAmount = round2(grossTuition * discountRate);
  const netTuition = round2(grossTuition - discountAmount);
  const serviceFee = STUDENT_SERVICE_FEE_KWD;
  const registrationFee = REGISTRATION_FEE_KWD[level];
  const totalPayable = round2(netTuition + serviceFee + registrationFee);
  const installmentBalance = round2(totalPayable - registrationFee);

  return {
    credits,
    creditPrice,
    grossTuition,
    discountRate,
    discountAmount,
    netTuition,
    serviceFee,
    registrationFee,
    totalPayable,
    installmentBalance,
    installments: buildInstallments(installmentBalance),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Finance policy notes — rendered verbatim in the payments UI.
// ---------------------------------------------------------------------------

export const FINANCE_POLICY_NOTES = {
  en: [
    'Repeated courses are not eligible for the grant discount (self-funded students).',
    'Summer fees must be paid in full before the semester starts (existing students).',
    'A 5 KWD late fee applies from the first day of the semester and must be paid to continue registration.',
    'A copy of your Civil ID must be uploaded with every TWIMC request.',
    'Installments are due in study weeks 4, 8 and 12.',
  ],
  ar: [
    'المواد المعادة غير مؤهلة لخصم المنحة (للطلبة ذاتيي التمويل).',
    'تُدفع رسوم الصيف بالكامل قبل بداية الفصل (للطلبة الحاليين).',
    'تُطبّق رسوم تأخير قدرها 5 دنانير من أول يوم في الفصل ويجب سدادها لمتابعة التسجيل.',
    'يجب إرفاق نسخة من البطاقة المدنية مع كل طلب «لمن يهمه الأمر».',
    'تُستحق الأقساط في الأسابيع الدراسية 4 و8 و12.',
  ],
} as const;
