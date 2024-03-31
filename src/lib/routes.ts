import { FastifyInstance } from 'fastify';
import { getHealth } from './controllers/get-health';
import { getPings } from './controllers/get-ping';
import { postPing } from './controllers/post-ping';
import { getPingStats } from './controllers/get-ping-stats';
import { postGetAddrByVal } from './controllers/post-addr';
import { getAddrPings } from './controllers/get-addr-pings';
import { getAddrPingStats } from './controllers/get-addr-ping-stats';
import { getAddrs } from './controllers/get-addrs';
import { postJwtAuth, postJwtAuthVerify } from './controllers/post-jwt-auth';
import { postTokenExchange, postUserLogin, postUserVerify } from './controllers/post-user-auth';
import { registerUser } from './controllers/register-user';
import { postGetKeychainKeys } from './controllers/post-get-keychain-keys';
import { getUser } from './controllers/get-user';

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

  app.post('/v1/jwt/auth', postJwtAuth);
  app.post('/v1/jwt/auth/verify', postJwtAuthVerify);
  
  app.get('/v1/users/:userId', getUser);
  app.post('/v1/users/register', registerUser);

  return app;
}


export function registerRoutes(app: FastifyInstance): FastifyInstance {
  app.post('/v1/user/login', postUserLogin);
  app.get('/v1/user/verify', postUserVerify);

  return app;
}

export function registerAuthenticatedRoutes(app: FastifyInstance): FastifyInstance {
  app.post('/v1/jwt/exchange', postTokenExchange);

  return app;
}

export function registerAuthorizedRoutes(app: FastifyInstance) {
  app.post('/v1/keychain/keys', postGetKeychainKeys);
}