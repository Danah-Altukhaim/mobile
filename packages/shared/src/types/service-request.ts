export type ServiceRequestType =
  | 'twimc'
  | 'twimc_balance'
  | 'transcript'
  | 'expected_graduation_docs'
  | 'absence_excuse'
  | 'puc_letter_with_stipend'
  | 'puc_letter_no_stipend'
  | 'semester_withdrawal'
  | 'college_withdrawal'
  | 'social_allowance'
  | 'bank_details_change'
  | 'grade_appeal'
  | 'student_id_lost'
  | 'student_id_photo'
  | 'sport_discount'
  | 'transfer_credit_equivalency'
  | 'complaint'
  | 'suggestion';

export type ServiceRequestStatus =
  | 'submitted'
  | 'in_progress'
  | 'pending_advisor'
  | 'pending_finance'
  | 'pending_puc'
  | 'pending_payment'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface ServiceRequestStep {
  key: string;
  label_ar: string;
  label_en: string;
  state: 'done' | 'current' | 'upcoming' | 'rejected';
  comment_ar?: string;
  comment_en?: string;
  timestamp?: string;
}

export type ServiceRequestAttachmentStatus = 'pending' | 'approved' | 'rejected';

export interface ServiceRequestAttachment {
  id: string;
  name: string;
  size_kb: number;
  uploaded_at: string;
  kind: 'civil_id' | 'passport' | 'form' | 'medical' | 'proof' | 'other';
  status?: ServiceRequestAttachmentStatus;
  rejection_reason_ar?: string;
  rejection_reason_en?: string;
}

export interface ServiceRequest {
  id: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  reference_no: string;
  created_at: string;
  updated_at: string;
  title_ar: string;
  title_en: string;
  category: 'registration' | 'finance' | 'student_life' | 'admissions' | 'it';
  funding_path?: 'self' | 'puc' | 'other' | null;
  workflow: ServiceRequestStep[];
  attachments: ServiceRequestAttachment[];
  notes?: string;
  /**
   * Payment state for requests that require a fee (TWIMC, transcript). When
   * `pending` with an outstanding balance the request is on finance hold: it
   * won't be processed until the student clears the balance.
   */
  payment_status?: 'paid' | 'pending' | 'not_required';
  /** Outstanding finance balance (KWD) blocking this request from processing. */
  outstanding_balance_kwd?: number;
  rejection_reason_ar?: string;
  rejection_reason_en?: string;
  rejected_at?: string;
  rejected_by_ar?: string;
  rejected_by_en?: string;
}

/**
 * CCK policy: TWIMC and transcript requests can't be issued while the student
 * has an outstanding balance or overdue installments. These are the request
 * types subject to that finance hold.
 */
export const FINANCE_HOLD_SERVICE_TYPES: readonly ServiceRequestType[] = [
  'twimc',
  'twimc_balance',
  'transcript',
];

/**
 * A request is on finance hold when it's a fee-bearing type, its payment is
 * still pending, and there's an outstanding balance. Held requests are not
 * processed (and are hidden from the admin queue) until the balance clears.
 */
export function isServiceRequestOnFinanceHold(req: ServiceRequest): boolean {
  if (!FINANCE_HOLD_SERVICE_TYPES.includes(req.type)) return false;
  const outstanding = req.outstanding_balance_kwd ?? 0;
  return req.payment_status === 'pending' && outstanding > 0;
}

export interface ContactDirectoryEntry {
  id: string;
  department_ar: string;
  department_en: string;
  email: string;
  phone?: string;
  category: 'registration' | 'finance' | 'admissions' | 'student_life' | 'it' | 'academic';
}

export interface ExcusedAbsencePolicy {
  validity_days: number;
  body_ar: string;
  body_en: string;
  updated_at: string;
}

export type SocialAllowanceCategory =
  | 'kuwaiti'
  | 'kuwaiti_mother_dependant'
  | 'disabled'
  | 'married';

/** CCK Hub Feedback v3 — applicant flow drives the document order. */
export type SocialAllowanceFlow = 'newly_admitted' | 'expected_graduation';

export interface SocialAllowanceDocRequirement {
  key: string;
  label_ar: string;
  label_en: string;
  required: boolean;
}
