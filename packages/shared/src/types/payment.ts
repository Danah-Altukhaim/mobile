export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'knet' | 'mada' | 'benefit' | 'naps' | 'omannet' | 'apple_pay' | 'google_pay' | 'visa' | 'mastercard' | 'stc_pay' | 'cash';

export interface Payment {
  id: string;
  student_id: string;
  term_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod | null;
  tap_reference: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Fee {
  id: string;
  student_id: string;
  term_id: string;
  type: 'tuition' | 'lab' | 'housing' | 'meal' | 'registration' | 'other';
  description_ar: string;
  description_en: string;
  amount: number;
  due_date: string;
  paid_amount: number;
  currency: string;
}

export interface PaymentDashboard {
  balance_due: number;
  currency: string;
  next_due_date: string | null;
  fees: Fee[];
  recent_payments: Payment[];
}

export interface PaymentInitiateRequest {
  amount: number;
  fee_ids: string[];
  method: PaymentMethod;
  return_url: string;
}

export interface PaymentInitiateResponse {
  payment_id: string;
  redirect_url: string;
  tap_charge_id: string;
}
