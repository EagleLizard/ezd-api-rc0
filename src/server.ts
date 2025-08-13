
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { registerRoutes, registerPublicRoutes, registerAuthenticatedRoutes, registerAuthorizedRoutes } from './lib/routes';
import { config } from './config';
import { logger } from './lib/logger';
import { EzdSessionStore } from './lib/db/ezd-session-store';
import { isString } from './util/validate-primitives';
import { AuthService } from './lib/services/auth-service';
import { UserDto } from './lib/models/user-dto';
import { UserService } from './lib/services/user-service';
import { JwtSessionPayload } from './lib/models/jwt';
import { UserRoleDto } from './lib/models/user-role-dto';

export async function initServer(): Promise<void> {
  let initServerPromise: Promise<void>;

  initServerPromise = new Promise((resolve, reject) => {
    let app: FastifyInstance;
    app = Fastify({
      logger: logger,
    });

    // middleware
    app.register(cors, {
      origin: config.EZD_WEB_ORIGIN,
      credentials: true,
    });
    app.register(fastifyCookie);
    app.register((fastify, opts, done) => {
      const store = new EzdSessionStore();
      fastify.register(fastifySession, {
        secret: config.SESSION_SECRET,
        saveUninitialized: true, 
        store,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          secure: 'auto',
          httpOnly: false,
        },
      });
      registerRoutes(fastify);
      done();
    });
    // app.addHook('onRequest', (req, rep, done) => {
    //   console.log('onSend');
    //   console.log(req.session.sessionId);
    //   done();
    // });
    app.addHook('onSend', (req, rep, pauload: unknown, done) => {
      // console.log('onSend');
      // console.log(req.session?.sessionId);
      // console.log(req.cookies);
      done();
    });

    // routes
    app = registerPublicRoutes(app);

    // authorized routes
    app.register((fastify, opts, done) => {
      fastify.addHook('preHandler', authNPreHandler);
      registerAuthenticatedRoutes(fastify);
      done();
    });
    app.register((fastify, opts, done) => {
      fastify.addHook('preHandler', authNPreHandler);
      fastify.addHook('preHandler', authZPreHandler);
      registerAuthorizedRoutes(fastify);
      done();
    });

    app.listen({
      port: config.port,
      host: '0.0.0.0',
    }, (err, address) => {
      if(err) {
        reject(err);
        return;
      }
      const startLogStr = `Listening on port ${config.port}, address: ${address}`;
      process.stdout.write(`${startLogStr}\n`);
      logger.info(startLogStr);
      resolve();
    });
  });
  await initServerPromise;

}

async function authZPreHandler(req: FastifyRequest, rep: FastifyReply) {
  let user: UserDto;
  let userRole: UserRoleDto | undefined;
  if(req.user === undefined) {
    rep.code(403);
    rep.send({});
    return;
  }
  user = req.user;
  userRole = await UserService.getUserRole(user.user_id);
  req.userRole = userRole;
}

async function authNPreHandler(req: FastifyRequest, rep: FastifyReply) {
  let apiToken: string;
  let jwtPayload: JwtSessionPayload | undefined;
  let jwtValid: boolean;
  let user: UserDto | undefined;
  console.log('~ preHandler ~');
  if(!isString(req.headers['x-api-token'])) {
    rep.code(401);
    rep.send({});
    return;
  }
  apiToken = req.headers['x-api-token'];
  console.log({
    apiToken,
  });
  jwtPayload = await AuthService.verifyJwtSession(apiToken);
  jwtValid = jwtPayload !== undefined;
  if(
    !jwtValid
    || !isString(jwtPayload?.user_id)
  ) {
    rep.code(401);
    rep.send({});
    return;
  }
  user = await UserService.getUser(jwtPayload.user_id);
  if(user === undefined) {
    rep.code(403)
    rep.send({});
    return;
  }
  req.user = user;
}
