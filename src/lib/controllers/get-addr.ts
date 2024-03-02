import { Request, Response } from 'express';
import { isString } from '../../util/validate-primitives';
import { PingService } from '../services/ping-service';

export async function getAddr(req: Request, res: Response) {
  if(!isString(req.body.addr)) {
    res.status(400).send(`Error: expected body.addr to be 'string', received: ${typeof req.body.addr}`);
    return;
  }
  let addrDto = await PingService.getAddrByVal(req.body.addr);
  res.status(200).send({
    result: addrDto,
  });
}
