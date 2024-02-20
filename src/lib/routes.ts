
import { Express } from 'express';
import { getHealth } from './controllers/get-health';

export function registerRoutes(app: Express): Express {

  app.get('/v1/health', getHealth);

  return app;
}
