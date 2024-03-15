import { FastifyInstance } from 'fastify';
import { getHealth2 } from './controllers/get-health';
import { getPings2 } from './controllers/get-ping';
import { postPing2 } from './controllers/post-ping';
import { getPingStats2 } from './controllers/get-ping-stats';
import { postGetAddrByVal2 } from './controllers/post-addr';
import { getAddrPings2 } from './controllers/get-addr-pings';
import { getAddrPingStats2 } from './controllers/get-addr-ping-stats';
import { getAddrs2 } from './controllers/get-addrs';
import { postUserAuth2, postUserAuthVerify2 } from './controllers/post-user-auth';
import { postUserLogin2 } from './controllers/post-user-login';
import { registerUser2 } from './controllers/register-user';

export function registerPublicRoutes(app: FastifyInstance): FastifyInstance {
  app.get('/v1/health', getHealth2);

  app.get('/v1/ping', getPings2);
  app.post('/v1/ping', postPing2);
  app.get('/v1/ping/stats', getPingStats2);
  // app.get('/v1/ping/stats', getPingStats2);

  // // app.get('/v1/addr', getAddr2);
  app.post('/v1/addr', postGetAddrByVal2);
  app.get('/v1/addr/:id/pings', getAddrPings2);
  app.get('/v1/addr/:id/ping/stats', getAddrPingStats2);
  app.get('/v1/addrs', getAddrs2);

  app.post('/v1/user/auth', postUserAuth2);
  app.post('/v1/user/auth/verify', postUserAuthVerify2);
  
  app.post('/v1/users/register', registerUser2);
  return app;
}


export function registerAuthorizedRoutes(app: FastifyInstance): FastifyInstance {
  app.post('/v1/user/login', postUserLogin2);
  return app;
}