import { Request, Response } from 'express';

export function getHealth(req: Request, res: Response) {
  res.status(200).send({
    status: 'ok',
  });
}
