import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { SocialController } from '../controllers/social.controller';

export function registerRoutes(app: Express): void {
  const controller = new SocialController();

  app.get('/api/v1/feed', authenticate, controller.getFeed);
  app.post('/api/v1/feed', authenticate, controller.createPost);
  app.get('/api/v1/messages', authenticate, controller.getMessages);
  app.post('/api/v1/messages/:userId', authenticate, controller.sendMessage);
}
