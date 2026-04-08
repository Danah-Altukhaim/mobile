import { API_PATHS } from '@masari/shared';
import type { PaymentInitiateRequest, PaymentInitiateResponse } from '@masari/shared';
import { apiClient } from './client';

export const paymentApi = {
  initiatePayment: (data: PaymentInitiateRequest) =>
    apiClient.post<PaymentInitiateResponse>(API_PATHS.PAYMENT_INITIATE, data),

  getReceipt: (paymentId: string) =>
    apiClient.get<{ receipt_url: string }>(API_PATHS.PAYMENT_RECEIPT(paymentId)),
};
