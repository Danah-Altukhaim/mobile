import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { NotificationController } from '../controllers/notification.controller';

export function registerRoutes(app: Express): void {
  const controller = new NotificationController();

  app.get('/api/v1/notifications', authenticate, controller.getNotifications);
  app.put('/api/v1/notifications/preferences', authenticate, controller.updatePreferences);
}
