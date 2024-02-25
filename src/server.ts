
import express, { Express } from 'express';

import { config } from './config';
import { registerRoutes } from './lib/routes';
import { logger } from './lib/logger';
import { logMiddleware } from './lib/middleware/log-middleware';

export async function initServer(): Promise<void> {

  return new Promise<void>((resolve, reject) => {
    let app: Express;
    let port: number;
    port = config.port;
    app = express();
    
    // middleware
    app.use(logMiddleware);

    // routes
    app = registerRoutes(app);

    app.listen(port, () => {
      // console.log(`listening on port: ${port}`);
      logger.info(`listening on port: ${port}`);
      resolve();
    });
  });
}
