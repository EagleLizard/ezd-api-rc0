
import morgan, { StreamOptions } from 'morgan';

import { logger } from '../logger';
import { NextFunction, Request, Response } from 'express';

const morganStream: StreamOptions = {
  write: (message) => {
    return logger.info(message);
  }
};

const logFmt = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

const morganMiddleware = morgan(logFmt, {
  stream: morganStream,
});

export function logMiddleware(req: Request, res: Response, next: NextFunction) {
  morganMiddleware(req, res, err => {
    // res.on('finish', () => {
    //   console.log(req);
    // })
    if(err !== undefined) {
      logger.error(err);
    }
  });
  next();
}
