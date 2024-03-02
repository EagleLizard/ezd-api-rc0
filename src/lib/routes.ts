
import { Express } from 'express';
import { getHealth } from './controllers/get-health';
import { getPings } from './controllers/get-ping';
import { postPing } from './controllers/post-ping';
import { getAddr } from './controllers/get-addr';
import { getPingStats } from './controllers/get-ping-stats';

export function registerRoutes(app: Express): Express {

  app.get('/v1/health', getHealth);

  app.get('/v1/ping', getPings);
  app.post('/v1/ping', postPing);
  app.get('/v1/ping/stats', getPingStats);

  app.get('/v1/addr', getAddr);

  return app;
}
