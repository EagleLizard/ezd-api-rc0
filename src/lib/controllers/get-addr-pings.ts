
import { Request, Response } from 'express';
import { PingService } from '../services/ping-service';
import { PingDto } from '../models/ping-dto';
import { PingAddrDto } from '../models/ping-addr-dto';

export async function getAddrPings(req: Request, res: Response) {;
  let addrDto: PingAddrDto
  let pingDtos: PingDto[];
  let addrId: string;
  addrId = req.params.id;
  pingDtos = await PingService.getPingsByAddr(addrId)
  addrDto = await PingService.getAddrById(addrId)
  res.status(200).send({
    count: pingDtos.length,
    addr: addrDto.addr,
    result: pingDtos,
  });
}
