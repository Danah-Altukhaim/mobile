import { Express } from 'express';
import { AuthController } from '../controllers/auth.controller';

export function registerRoutes(app: Express): void {
  const controller = new AuthController();

  app.post('/api/v1/auth/sso/initiate', controller.ssoInitiate);
  app.post('/api/v1/auth/sso/callback', controller.ssoCallback);
  app.post('/api/v1/auth/token/refresh', controller.tokenRefresh);
}
