
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { registerAuthorizedRoutes, registerPublicRoutes } from './lib/routes';
import { config } from './config';
import { logger } from './lib/logger';
import { EzdSessionStore } from './lib/db/ezd-session-store';

export async function initServer(): Promise<void> {
  let initServerPromise: Promise<void>;

  initServerPromise = new Promise((resolve, reject) => {
    let app: FastifyInstance;
    app = Fastify({
      logger: true,
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
        },
      });
      registerAuthorizedRoutes(fastify);
      done();
    })
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

    // server = app.listen({
    app.listen({
      port: config.port,
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
