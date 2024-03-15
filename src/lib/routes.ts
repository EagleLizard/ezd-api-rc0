import { FastifyInstance } from 'fastify';
import { getHealth } from './controllers/get-health';
import { getPings } from './controllers/get-ping';
import { postPing } from './controllers/post-ping';
import { getPingStats } from './controllers/get-ping-stats';
import { postGetAddrByVal } from './controllers/post-addr';
import { getAddrPings } from './controllers/get-addr-pings';
import { getAddrPingStats } from './controllers/get-addr-ping-stats';
import { getAddrs } from './controllers/get-addrs';
import { postUserAuth, postUserAuthVerify } from './controllers/post-user-auth';
import { postUserLogin } from './controllers/post-user-login';
import { registerUser } from './controllers/register-user';

export function registerPublicRoutes(app: FastifyInstance): FastifyInstance {
  app.get('/v1/health', getHealth);

  app.get('/v1/ping', getPings);
  app.post('/v1/ping', postPing);
  app.get('/v1/ping/stats', getPingStats);
  // app.get('/v1/ping/stats', getPingStats2);

  // // app.get('/v1/addr', getAddr2);
  app.post('/v1/addr', postGetAddrByVal);
  app.get('/v1/addr/:id/pings', getAddrPings);
  app.get('/v1/addr/:id/ping/stats', getAddrPingStats);
  app.get('/v1/addrs', getAddrs);

  app.post('/v1/user/auth', postUserAuth);
  app.post('/v1/user/auth/verify', postUserAuthVerify);
  
  app.post('/v1/users/register', registerUser);
  return app;
}


export function registerAuthorizedRoutes(app: FastifyInstance): FastifyInstance {
  app.post('/v1/user/login', postUserLogin);
  return app;
}