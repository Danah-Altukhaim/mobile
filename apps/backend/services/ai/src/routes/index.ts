import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { AIController } from '../controllers/ai.controller';

export function registerRoutes(app: Express): void {
  const controller = new AIController();

  app.post('/api/v1/ai/chat', authenticate, controller.chat);
  app.post('/api/v1/ai/escalate', authenticate, controller.escalate);
  app.get('/api/v1/ai/course-recommendations', authenticate, controller.getCourseRecommendations);
  app.get('/api/v1/ai/nudges', authenticate, controller.getNudges);
  app.get('/api/v1/ai/chat/:conversationId', authenticate, controller.getConversation);
}
