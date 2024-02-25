
import { Express } from 'express';
import { getHealth } from './controllers/get-health';
import { getPings } from './controllers/get-ping';

export function registerRoutes(app: Express): Express {

  app.get('/v1/health', getHealth);

  app.get('/v1/ping', getPings);

  return app;
}
