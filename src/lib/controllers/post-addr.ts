import { Request, Response } from 'express';
import { isString } from '../../util/validate-primitives';
import { PingService } from '../services/ping-service';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function postGetAddrByVal(req: Request, res: Response) {
  if(!isString(req.body.addr)) {
    res.status(400).send(`Error: expected body.addr to be 'string', received: ${typeof req.body.addr}`);
    return;
  }
  let addrDto = await PingService.getAddrByVal(req.body.addr);
  res.status(200).send({
    result: addrDto,
  });
}
export async function postGetAddrByVal2(
  req: FastifyRequest<{
    Body: {
      addr?: string;
    }
  }>,
  rep: FastifyReply
) {
  if(!isString(req.body.addr)) {
    rep.code(400)
    return `Error: expected body.addr to be 'string', received: ${typeof req.body.addr}`;
  }
  let addrDto = await PingService.getAddrByVal(req.body.addr);
  rep.code(200);
  return {
    result: addrDto,
  };
}
