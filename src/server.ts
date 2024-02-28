
import express, { Express } from 'express';

import { config } from './config';
import { registerRoutes } from './lib/routes';
import { logger } from './lib/logger';
import { logMiddleware } from './lib/middleware/log-middleware';
import { EXIT_SIGNAL_CODES } from './constants';
import { Server } from 'http';

export async function initServer(): Promise<void> {
  let initServerPromise: Promise<void>;
  let server: Server;

  initServerPromise = new Promise<void>((resolve, reject) => {
    let app: Express;
    let port: number;
    port = config.port;
    app = express();
    
    // middleware
    app.use(logMiddleware);

    // routes
    app = registerRoutes(app);

    server = app.listen(port, () => {
      logger.info(`listening on port: ${port}`);
      resolve();
    });
  });

  await initServerPromise;

  EXIT_SIGNAL_CODES.forEach(exitSignal => {
    process.on(exitSignal, (signal) => {
      shutdown(signal, server);
    });
  });

  process.on('unhandledRejection', (reason) => {
    logger.info(`Unhandled rejection: ${reason}`);
  });
}

async function shutdown(signal: string, server: Server) {
  logger.info(`${signal} received.`);
  server.close(err => {
    if(err) {
      logger.info(`Error closing HTTP server: ${err}`);
      process.exitCode = 1;
    } else {
      logger.info('HTTP server closed');
      process.exitCode = 0;
    }
  })
}
