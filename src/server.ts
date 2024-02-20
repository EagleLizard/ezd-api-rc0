
import express, { Express } from 'express';

import { config } from './config';
import { registerRoutes } from './lib/routes';

export function initServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let app: Express;
    let port: number;
    port = config.port;
    app = express();
    
    // middleware

    // routes
    app = registerRoutes(app);

    app.listen(port, () => {
      console.log(`listening on port: ${port}`);
      resolve();
    });
  });
}
