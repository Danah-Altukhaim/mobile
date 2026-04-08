import { Request, Response } from 'express';
import crypto from 'crypto';
import type { AuthRequest } from '@masari/backend-shared';

const TAP_WEBHOOK_SECRET = process.env.TAP_WEBHOOK_SECRET || 'tap_test_secret';

export class PaymentController {
  /** POST /api/v1/payments/initiate */
  initiatePayment = (req: AuthRequest, res: Response): void => {
    const { amount, currency, fee_ids, redirect_url } = req.body;

    if (!amount || !fee_ids?.length) {
      res.status(400).json({
        success: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message_ar: 'المبلغ ومعرفات الرسوم مطلوبة',
            message_en: 'amount and fee_ids are required',
          },
        ],
      });
      return;
    }

    const paymentId = `pay_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

    res.json({
      success: true,
      data: {
        payment_id: paymentId,
        amount: amount,
        currency: currency || 'SAR',
        status: 'pending',
        tap_url: `https://checkout.tap.company/v2/checkout/${paymentId}`,
        redirect_url: redirect_url || 'https://masari.app/payments/callback',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };

  /** POST /api/v1/payments/webhook */
  handleWebhook = (req: Request, res: Response): void => {
    const signature = req.headers['tap-signature'] as string;

    if (!signature) {
      res.status(401).json({
        success: false,
        errors: [
          {
            code: 'WEBHOOK_UNAUTHORIZED',
            message_ar: 'توقيع الطلب مفقود',
            message_en: 'Missing webhook signature',
          },
        ],
      });
      return;
    }

    // Mock signature verification
    const expectedSignature = crypto
      .createHmac('sha256', TAP_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Payment Webhook] Signature mismatch - proceeding in dev mode');
    }

    const { id, status, amount, currency, metadata } = req.body;

    console.log(`[Payment Webhook] Received: id=${id}, status=${status}, amount=${amount} ${currency}`);
    console.log(`[Payment Webhook] Metadata:`, metadata);

    // In production: update payment record, trigger notifications, etc.

    res.status(200).json({ success: true });
  };

  /** GET /api/v1/payments/:id/receipt */
  getReceipt = (req: AuthRequest, res: Response): void => {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        payment_id: id,
        receipt_number: `RCP-${Date.now().toString(36).toUpperCase()}`,
        student_name_ar: 'دانة بنت عبدالله العتيبي',
        student_name_en: 'Danah Abdullah Al-Otaibi',
        student_id: 'STU-443012',
        university_ar: 'جامعة الملك سعود',
        university_en: 'King Saud University',
        items: [
          {
            description_ar: 'رسوم الفصل الدراسي - دفعة جزئية',
            description_en: 'Semester Tuition Fee - Partial Payment',
            amount: 12500.0,
          },
        ],
        total_amount: 12500.0,
        currency: 'SAR',
        payment_method_ar: 'بطاقة مدى',
        payment_method_en: 'Mada Card',
        payment_date: '2026-02-10T14:30:00Z',
        tap_reference: 'TAP-abc123',
        status: 'paid',
        pdf_url: `/api/v1/payments/${id}/receipt.pdf`,
        note_ar: 'هذا الإيصال صادر إلكترونيًا ولا يحتاج إلى توقيع',
        note_en: 'This receipt is electronically generated and does not require a signature',
      },
      meta: {
        synced_at: new Date().toISOString(),
      },
    });
  };
}
