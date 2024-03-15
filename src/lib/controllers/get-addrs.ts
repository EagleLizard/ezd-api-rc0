
import { FastifyReply, FastifyRequest } from 'fastify';

import { PingAddrDto } from '../models/ping-addr-dto';
import { PingService } from '../services/ping-service';
import { isObject, isString } from '../../util/validate-primitives';
import { logger } from '../logger';

export async function getAddrs(req: FastifyRequest, rep: FastifyReply) {
  let addrDtos: PingAddrDto[];
  try {
    addrDtos = await PingService.getAddrs();
  } catch(e) {
    console.error(e);
    let errMessage = (isObject(e) && isString(e.message))
      ? e.message
      : 'Failed to get addrs'
    ;
    logger.error(e);
    rep.code(400)
    return {
      error: errMessage,
    };
  }
  rep.code(200)
  return {
    count: addrDtos.length,
    result: addrDtos,
  };
}
