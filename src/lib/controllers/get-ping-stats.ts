
import { FastifyReply, FastifyRequest } from 'fastify';

import { PingStatDto } from '../models/ping-stat-dto';
import { PingService } from '../services/ping-service';
import { ADDR_TYPE_ENUM } from '../models/ping-addr-dto';
import { TimeBucketUnit, validateTimeBucketUnit } from '../models/ping-args';

export async function getPingStats(
  req: FastifyRequest<{
    Querystring: {
      addr_type?: string,
      bucket_val?: string,
      bucket_unit?: string,
    }
  }>,
  rep: FastifyReply
) {
  let addr_type: ADDR_TYPE_ENUM | undefined;
  let bucket_val: number | undefined;
  let bucket_unit: TimeBucketUnit | undefined;
  let pingStats: PingStatDto[];

  if(
    (req.query.addr_type !== undefined)
    && (
      (req.query.addr_type === ADDR_TYPE_ENUM.GLOBAL)
      || (req.query.addr_type === ADDR_TYPE_ENUM.LOCAL)
    )
  ) {
    addr_type = req.query.addr_type;
  }
  if(
    (req.query.bucket_val !== undefined)
    && !isNaN(+req.query.bucket_val)
  ) {
    bucket_val = +req.query.bucket_val;
    if(
      (req.query.bucket_unit !== undefined)
      && validateTimeBucketUnit(req.query.bucket_unit)
    ) {
      bucket_unit = req.query.bucket_unit;
    }
  }
  pingStats = await PingService.getPingStats({
    addrType: addr_type,
    bucketVal: bucket_val,
    bucketUnit: bucket_unit,
  });
  rep.code(200)
  return {
    count: pingStats.length,
    result: pingStats,
  };
}
