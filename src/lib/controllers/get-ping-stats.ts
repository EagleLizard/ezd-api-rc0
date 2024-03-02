
import { Request, Response } from 'express';
import { PingStatDto } from '../models/ping-stat-dto';
import { PingService } from '../services/ping-service';

export async function getPingStats(req: Request, res: Response) {
  let pingStats: PingStatDto[];
  pingStats = await PingService.getPingStats();
  res.status(200).send({
    count: pingStats.length,
    result: pingStats,
  });
}
