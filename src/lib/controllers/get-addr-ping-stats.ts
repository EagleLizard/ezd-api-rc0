
import { Request, Response } from 'express';
import { PingService } from '../services/ping-service';

export async function getAddrPingStats(req: Request, res: Response) {
  const addrId = req.params.id;
  const pingStats = await PingService.getAddrPingStats(addrId);
  res.status(200).send({
    count: pingStats.length,
    result: pingStats,
  });
}
