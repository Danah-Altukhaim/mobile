import { Express } from 'express';
import { IntegrationController } from '../controllers/integration.controller';

export function registerRoutes(app: Express): void {
  const controller = new IntegrationController();

  app.get('/api/v1/integrations/adapters', controller.getAdapters);
  app.post('/api/v1/integrations/sync/:adapterId', controller.triggerAdapterSync);
  app.get('/api/v1/integrations/sync/:jobId/status', controller.getSyncJobStatus);
}
