import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { AdminController } from '../controllers/admin.controller';

export function registerRoutes(app: Express): void {
  const controller = new AdminController();

  app.get('/api/v1/admin/analytics/engagement', authenticate, controller.getEngagementAnalytics);
  app.get('/api/v1/admin/analytics/retention', authenticate, controller.getRetentionAnalytics);
  app.get('/api/v1/admin/students/at-risk', authenticate, controller.getAtRiskStudents);
  app.post('/api/v1/admin/students/:id/intervene', authenticate, controller.intervene);
  app.post('/api/v1/admin/students/:id/advising-meetings', authenticate, controller.scheduleAdvisingMeeting);
  app.post('/api/v1/admin/communications/send', authenticate, controller.sendCommunication);
  app.put('/api/v1/admin/config/branding', authenticate, controller.updateBranding);
  app.get('/api/v1/admin/users', authenticate, controller.listAdminUsers);
  app.post('/api/v1/admin/users', authenticate, controller.createAdminUser);
  app.put('/api/v1/admin/users/:id/role', authenticate, controller.updateAdminRole);
  app.post('/api/v1/admin/students/import', authenticate, controller.importStudents);
  app.get('/api/v1/admin/students/export', authenticate, controller.exportStudents);
  app.get('/api/v1/admin/integrations/status', authenticate, controller.getIntegrationStatus);
  app.post('/api/v1/admin/integrations/sync', authenticate, controller.triggerSync);
}
