
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { registerRoutes, registerPublicRoutes, registerAuthorizedRoutes } from './lib/routes';
import { config } from './config';
import { logger } from './lib/logger';
import { EzdSessionStore } from './lib/db/ezd-session-store';
import { isString } from './util/validate-primitives';
import { AuthService } from './lib/services/auth-service';
import { JwtPayload } from 'jsonwebtoken';

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
      fastify.addHook('preHandler', async (req, res) => {
        let apiToken: string;
        let jwtPayload: JwtPayload | undefined;
        let jwtValid: boolean;
        console.log('~ preHandler ~');
        if(!isString(req.headers['x-api-token'])) {
          res.code(401);
          res.send({});
          return;
        }
        apiToken = req.headers['x-api-token'];
        console.log({
          apiToken,
        });
        jwtPayload = await AuthService.verifyJwtSession(apiToken);
        jwtValid = jwtPayload !== undefined;
        if(!jwtValid) {
          res.code(401);
          res.send({});
          return;
        }
      });
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
      logger.info(`Listening on port ${config.port}, address: ${address}`);
      resolve();
    });
  });
  await initServerPromise;

}
