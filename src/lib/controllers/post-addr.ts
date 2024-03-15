
import { FastifyReply, FastifyRequest } from 'fastify';

import { isString } from '../../util/validate-primitives';
import { PingService } from '../services/ping-service';

export async function postGetAddrByVal(
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
