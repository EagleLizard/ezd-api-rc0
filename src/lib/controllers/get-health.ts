
import { FastifyReply, FastifyRequest } from 'fastify';

export function getHealth(req: FastifyRequest, rep: FastifyReply) {
  rep.code(200);
  return {
    status: 'ok',
  };
}
