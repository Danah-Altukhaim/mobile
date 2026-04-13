import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { FileController } from '../controllers/file.controller';

export function registerRoutes(app: Express): void {
  const controller = new FileController();

  app.post('/api/v1/files/upload', authenticate, controller.uploadFile);
  app.get('/api/v1/files/:id', authenticate, controller.getFile);
  app.post('/api/v1/files/transcript-request', authenticate, controller.requestTranscript);
  app.get('/api/v1/files/transcript-requests', authenticate, controller.getTranscriptRequests);
}
