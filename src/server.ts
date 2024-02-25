
import express, { Express } from 'express';

import { config } from './config';
import { registerRoutes } from './lib/routes';
import { logger } from './lib/logger';
import { logMiddleware } from './lib/middleware/log-middleware';
import { PostgresClient } from './lib/db/postgres-client';

export async function initServer(): Promise<void> {
  try {
    const client = await PostgresClient.getClient();
    const res = await client.query('select * from users');
    console.log(res.rows[0]);
  } catch(e) {
    console.error(e);
  }

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
