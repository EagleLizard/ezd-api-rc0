
import { Request, Response } from 'express';
import { PingAddrDto } from '../models/ping-addr-dto';
import { PingService } from '../services/ping-service';
import { isObject, isString } from '../../util/validate-primitives';
import { logger } from '../logger';

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
