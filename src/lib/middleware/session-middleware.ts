
import { Response, Request, NextFunction } from 'express';
import session from 'express-session';

const sessionPaths = [
  '/v1/user/login',
];

export function sessionMiddleware(opts: session.SessionOptions) {
  const sessionHandler = session({
    ...opts,
  });
  return (req: Request, res: Response, next: NextFunction) => {
    let hasSessionPath: boolean;
    hasSessionPath = sessionPaths.some(sessionPath => {
      return req.url.includes(sessionPath);
    });
    if(hasSessionPath) {
      return sessionHandler(req, res, next);
    } else {
      next();
    }
  }
}
