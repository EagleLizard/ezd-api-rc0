
import { Request, Response } from 'express';
import { PingService } from '../services/ping-service';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function getAddrPingStats(req: Request, res: Response) {
  const addrId = req.params.id;
  const pingStats = await PingService.getAddrPingStats(addrId);
  res.status(200).send({
    count: pingStats.length,
    result: pingStats,
  });
}
export async function getAddrPingStats2(
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  rep: FastifyReply
) {
  const addrId = req.params.id;
  const pingStats = await PingService.getAddrPingStats(addrId);
  rep.code(200)
  return {
    count: pingStats.length,
    result: pingStats,
  };
}
