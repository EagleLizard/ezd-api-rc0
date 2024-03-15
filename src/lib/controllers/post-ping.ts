
import { FastifyReply, FastifyRequest } from 'fastify';

import { InsertPingOpts } from '../models/ping-dto';
import { isObject, isString } from '../../util/validate-primitives';
import { PingService } from '../services/ping-service';

export async function postPing(req: FastifyRequest, rep: FastifyReply) {
  let opts: InsertPingOpts;
  try {
    opts = InsertPingOpts.deserialize(req.body);
  } catch(e) {
    console.log(e);
    let err = (isObject(e) && isString(e.message))
      ? {
        error: e.message,
      }
      : e
    ;
    rep.code(400);
    return err;
  }
  await PingService.insertPing(opts);
  rep.code(200);
}
