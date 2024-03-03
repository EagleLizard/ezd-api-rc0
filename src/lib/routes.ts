
import { Express } from 'express';
import { getHealth } from './controllers/get-health';
import { getPings } from './controllers/get-ping';
import { postPing } from './controllers/post-ping';
import { getAddr } from './controllers/get-addr';
import { getPingStats } from './controllers/get-ping-stats';
import { getAddrs } from './controllers/get-addrs';
import { getAddrPings } from './controllers/get-addr-pings';
import { getAddrPingStats } from './controllers/get-addr-ping-stats';

export function registerRoutes(app: Express): Express {

  app.get('/v1/health', getHealth);

  app.get('/v1/ping', getPings);
  app.post('/v1/ping', postPing);
  app.get('/v1/ping/stats', getPingStats);
  app.get('/v1/ping/stats', getPingStats);

  app.post('/v1/addr', getAddr);
  app.get('/v1/addr/:id/pings', getAddrPings);
  app.get('/v1/addr/:id/ping/stats', getAddrPingStats);
  app.get('/v1/addrs', getAddrs);

  return app;
}
