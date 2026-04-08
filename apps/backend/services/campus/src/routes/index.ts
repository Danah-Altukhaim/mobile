import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { CampusController } from '../controllers/campus.controller';

export function registerRoutes(app: Express): void {
  const controller = new CampusController();

  app.get('/api/v1/events', authenticate, controller.getEvents);
  app.post('/api/v1/events/:id/rsvp', authenticate, controller.rsvpEvent);
  app.get('/api/v1/clubs', authenticate, controller.getClubs);
  app.post('/api/v1/clubs/:id/join', authenticate, controller.joinClub);
}
