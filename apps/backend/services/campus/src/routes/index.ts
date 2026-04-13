import { Express } from 'express';
import { authenticate } from '@masari/backend-shared';
import { CampusController } from '../controllers/campus.controller';

export function registerRoutes(app: Express): void {
  const controller = new CampusController();

  app.get('/api/v1/events', authenticate, controller.getEvents);
  app.get('/api/v1/events/prayer-times', authenticate, controller.getPrayerTimes);
  app.get('/api/v1/events/:id', authenticate, controller.getEventDetail);
  app.post('/api/v1/events/:id/rsvp', authenticate, controller.rsvpEvent);
  app.get('/api/v1/clubs', authenticate, controller.getClubs);
  app.get('/api/v1/clubs/:id', authenticate, controller.getClubDetail);
  app.post('/api/v1/clubs/:id/join', authenticate, controller.joinClub);
  app.get('/api/v1/campus/buildings', authenticate, controller.getBuildings);
  app.get('/api/v1/campus/news', authenticate, controller.getNews);
  app.get('/api/v1/campus/dining', authenticate, controller.getDining);
  app.get('/api/v1/campus/lost-found', authenticate, controller.getLostFound);
}
