
import { FastifyReply, FastifyRequest } from 'fastify';

import { PingService } from '../services/ping-service';
import { PingDto } from '../models/ping-dto';
import { PingAddrDto } from '../models/ping-addr-dto';

export async function getAddrPings(
  req: FastifyRequest<{
    Params: {
      id: string;
    },
  }>,
  rep: FastifyReply
) {;
  let addrDto: PingAddrDto
  let pingDtos: PingDto[];
  let addrId: string;
  addrId = req.params.id;
  pingDtos = await PingService.getPingsByAddr(addrId)
  addrDto = await PingService.getAddrById(addrId)
  rep.code(200)
  return {
    count: pingDtos.length,
    addr: addrDto.addr,
    result: pingDtos,
  };
}
