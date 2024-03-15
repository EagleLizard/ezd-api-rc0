import { Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';

export function getHealth(req: Request, res: Response) {
  res.status(200).send({
    status: 'ok',
  });
}

export function getHealth2(req: FastifyRequest, rep: FastifyReply) {
  rep.code(200);
  return {
    status: 'ok',
  };
}
