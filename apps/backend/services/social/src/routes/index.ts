import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { SocialController } from '../controllers/social.controller';

export function registerRoutes(app: Express): void {
  const controller = new SocialController();

  app.get('/api/v1/feed', authenticate, controller.getFeed);
  app.post('/api/v1/feed', authenticate, controller.createPost);
  app.get('/api/v1/feed/study-groups', authenticate, controller.getStudyGroups);
  app.post('/api/v1/feed/study-groups/:groupId/join', authenticate, controller.joinStudyGroup);
  app.get('/api/v1/feed/mentoring', authenticate, controller.getMentoring);
  app.get('/api/v1/feed/anonymous-qa', authenticate, controller.getAnonymousQA);
  app.get('/api/v1/messages', authenticate, controller.getMessages);
  app.get('/api/v1/messages/:conversationId', authenticate, controller.getConversation);
  app.post('/api/v1/messages/:userId', authenticate, controller.sendMessage);
}
