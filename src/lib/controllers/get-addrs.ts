
import { Request, Response } from 'express';
import { PingAddrDto } from '../models/ping-addr-dto';
import { PingService } from '../services/ping-service';
import { isObject, isString } from '../../util/validate-primitives';
import { logger } from '../logger';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function getAddrs(req: Request, res: Response) {
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
    res.status(400).send({
      error: errMessage,
    });
    return;
  }
  res.status(200).send({
    count: addrDtos.length,
    result: addrDtos,
  })
}
export async function getAddrs2(req: FastifyRequest, rep: FastifyReply) {
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
