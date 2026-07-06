// Per-student credit-load rules from "Schedule Process and Rules.docx".
// Used by CourseRegistration to validate the student's selected credit load
// before submission, and to surface the rule to the student up front.

export const MAX_CREDITS_PER_TERM = 23;

/** Minimum credit load for a PUC-funded student in a regular (Fall/Spring) term. */
export const PUC_MIN_CREDITS_REGULAR = 12;

/** Self-funded students are free to register any load within the global range. */
export const SELF_FUND_MIN_CREDITS = 3;

import type { FundingType } from '../types/student';

export interface CreditLoadRange {
  /** Inclusive lower bound on credits the student must register for. */
  min: number;
  /** Inclusive upper bound on credits the student may register for. */
  max: number;
}

/** Returns the credit-load range applicable to `funding`, in study term `term`.
 *  Summer is uncapped on the lower bound for everyone — only the 23 cap holds. */
export function creditLoadRange(
  funding: FundingType,
  term: 'regular' | 'summer' = 'regular',
): CreditLoadRange {
  if (term === 'summer') {
    return { min: 0, max: MAX_CREDITS_PER_TERM };
  }
  if (funding === 'puc') {
    return { min: PUC_MIN_CREDITS_REGULAR, max: MAX_CREDITS_PER_TERM };
  }
  return { min: SELF_FUND_MIN_CREDITS, max: MAX_CREDITS_PER_TERM };
}
