import { Request, Response } from 'express';
import { InsertPingOpts } from '../models/ping-dto';
import { isObject, isString } from '../../util/validate-primitives';
import { PingService } from '../services/ping-service';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function postPing(req: Request, res: Response) {
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
    res.status(400).send(err);
    return;
  }
  await PingService.insertPing(opts);
  res.status(200).send();
}

export async function postPing2(req: FastifyRequest, rep: FastifyReply) {
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
