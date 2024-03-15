
import { FastifyReply, FastifyRequest } from 'fastify';

import { PingService } from '../services/ping-service';

export async function getAddrPingStats(
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
