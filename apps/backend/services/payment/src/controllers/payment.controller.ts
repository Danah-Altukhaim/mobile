import { Request, Response } from 'express';
import crypto from 'crypto';
import type { AuthRequest } from '@masari/backend-shared';
import { paymentQueries, mockData } from '@masari/backend-shared';

const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || 'tap_test_secret';

export class PaymentController {
  /** POST /api/v1/payments/initiate */
  initiatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, fee_ids, method, return_url } = req.body;

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

      // Generate idempotency key from fee_ids + student_id
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`${req.user.id}:${fee_ids.sort().join(',')}`)
        .digest('hex');

      // Create payment record in DB
      const payment = await paymentQueries.createPayment({
        studentId: req.user.id,
        termId: req.body.term_id || 'current',
        amount,
        currency: req.body.currency || 'KWD',
        method: method || 'card',
        feeIds: fee_ids,
        idempotencyKey,
      });

      // In production, this would call Tap Payments API to create a charge
      // For now, return a mock redirect URL
      const mockTapChargeId = `chg_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const redirectUrl = return_url
        ? `${return_url}?payment_id=${payment.id}&tap_id=${mockTapChargeId}`
        : `https://checkout.tap.company/v2/checkout/${mockTapChargeId}`;

      res.json({
        success: true,
        data: {
          payment_id: payment.id,
          redirect_url: redirectUrl,
          tap_charge_id: mockTapChargeId,
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Payment Initiate] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء إنشاء عملية الدفع',
            message_en: 'An error occurred while creating the payment',
          },
        ],
      });
    }
  };

  /** POST /api/v1/payments/webhook */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
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

      // Verify HMAC-SHA256 signature
      const expectedSignature = crypto
        .createHmac('sha256', TAP_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        res.status(401).json({
          success: false,
          errors: [
            {
              code: 'WEBHOOK_UNAUTHORIZED',
              message_ar: 'توقيع الطلب غير صالح',
              message_en: 'Invalid webhook signature',
            },
          ],
        });
        return;
      }

      const { id, status, reference, amount } = req.body;

      console.log(`[Payment Webhook] Received: id=${id}, status=${status}, amount=${amount}`);

      // Map Tap status to our status
      let internalStatus: 'completed' | 'failed' | 'refunded';
      switch (status) {
        case 'CAPTURED':
          internalStatus = 'completed';
          break;
        case 'REFUNDED':
          internalStatus = 'refunded';
          break;
        default:
          internalStatus = 'failed';
          break;
      }

      // Update payment status (also auto-applies payment to fees if completed)
      await paymentQueries.updatePaymentStatus(reference, internalStatus, id);

      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[Payment Webhook] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء معالجة الإشعار',
            message_en: 'An error occurred while processing the webhook',
          },
        ],
      });
    }
  };

  /** GET /api/v1/payments/:id/receipt */
  getReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const payment = await paymentQueries.getPaymentById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          errors: [
            {
              code: 'NOT_FOUND',
              message_ar: 'عملية الدفع غير موجودة',
              message_en: 'Payment not found',
            },
          ],
        });
        return;
      }

      // Verify the payment belongs to the requesting student
      if (payment.student_id !== req.user.id) {
        res.status(403).json({
          success: false,
          errors: [
            {
              code: 'FORBIDDEN',
              message_ar: 'لا يمكنك الوصول لهذا الإيصال',
              message_en: 'You do not have access to this receipt',
            },
          ],
        });
        return;
      }

      res.json({
        success: true,
        data: {
          payment_id: payment.id,
          receipt_number: `RCP-${payment.id.slice(-8).toUpperCase()}`,
          student_name_ar: req.user.name_ar,
          student_name_en: req.user.name_en,
          student_id: req.user.id,
          university_id: req.user.university_id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          tap_reference: payment.tap_reference,
          payment_date: payment.updated_at || payment.created_at,
          created_at: payment.created_at,
          pdf_url: `/api/v1/payments/${payment.id}/receipt.pdf`,
          note_ar: 'هذا الإيصال صادر إلكترونيًا ولا يحتاج إلى توقيع',
          note_en: 'This receipt is electronically generated and does not require a signature',
        },
        meta: {
          synced_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[Payment Receipt] Error:', err);
      res.status(500).json({
        success: false,
        errors: [
          {
            code: 'INTERNAL_ERROR',
            message_ar: 'حدث خطأ أثناء جلب الإيصال',
            message_en: 'An error occurred while fetching the receipt',
          },
        ],
      });
    }
  };

  /** GET /api/v1/payments/history */
  getHistory = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockPaymentHistory, meta: { source: 'mock' } });
  };

  /** GET /api/v1/payments/installments */
  getInstallments = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockInstallmentPlan, meta: { source: 'mock' } });
  };

  /** GET /api/v1/payments/financial-aid */
  getFinancialAid = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockFinancialAid, meta: { source: 'mock' } });
  };

  /** GET /api/v1/payments/refunds */
  getRefunds = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: mockData.mockRefunds, meta: { source: 'mock' } });
  };
}
