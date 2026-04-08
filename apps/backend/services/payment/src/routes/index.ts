import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { PaymentController } from '../controllers/payment.controller';

export function registerRoutes(app: Express): void {
  const controller = new PaymentController();

  app.post('/api/v1/payments/initiate', authenticate, controller.initiatePayment);
  app.post('/api/v1/payments/webhook', controller.handleWebhook);
  app.get('/api/v1/payments/:id/receipt', authenticate, controller.getReceipt);
}
