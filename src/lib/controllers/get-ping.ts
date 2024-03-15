
import { Request, Response } from 'express';
import { isObject, isString } from '../../util/validate-primitives';
import { GetPingsResult, PingService } from '../services/ping-service';
import { logger } from '../logger';
import { FastifyReply, FastifyRequest } from 'fastify';



export async function getPings(req: Request, res: Response) {
  const queryParams = req.query;
  let pingRes: GetPingsResult | undefined;
  // let limit: number | undefined;
  // if(
  //   (queryParams.limit !== undefined)
  //   && (!isNaN(+queryParams.limit))
  // ) {
  //   limit = +queryParams.limit;
  // }
  if(
    (queryParams.start !== undefined)
    && !isString(queryParams.start)
  ) {
    throw new Error(`Invalid type`)
  }
  try {
    pingRes = await PingService.getPings({
      start: queryParams.start,
    });
  } catch(e) {
    let errMsg: string;
    console.error(e);
    logger.error(e);
    errMsg = (isObject(e) && isString(e.message))
      ? e.message
      : `params: ${queryParams}`
    ;
    res.status(400).send({
      error: errMsg,
    });
    return;
  }

  const {
    avg_time_ms,
    min_time,
    max_time,
    median_time,
    ping_count,
    pings,
  } = pingRes;
  
  res.status(200).send({
    result: {
      avg_time_ms,
      min_time,
      max_time,
      median_time,
      ping_count,
      pings,
    },
  });
}

export async function getPings2(
  req: FastifyRequest<{
    Querystring: {
      start?: string,
      limit?: string,
    }
  }>,
  rep: FastifyReply
) {
  const queryParams = req.query;
  let pingRes: GetPingsResult | undefined;
  // let limit: number | undefined;
  // if(
  //   (queryParams.limit !== undefined)
  //   && (!isNaN(+queryParams.limit))
  // ) {
  //   limit = +queryParams.limit;
  // }
  if(
    (queryParams.start !== undefined)
    && !isString(queryParams.start)
  ) {
    throw new Error(`Invalid type`)
  }
  try {
    pingRes = await PingService.getPings({
      start: queryParams.start,
    });
  } catch(e) {
    let errMsg: string;
    console.error(e);
    logger.error(e);
    errMsg = (isObject(e) && isString(e.message))
      ? e.message
      : `params: ${queryParams}`
    ;
    rep.code(400);
    return {
      error: errMsg,
    };
  }

  const {
    avg_time_ms,
    min_time,
    max_time,
    median_time,
    ping_count,
    pings,
  } = pingRes;
  
  rep.code(200)
  return {
    result: {
      avg_time_ms,
      min_time,
      max_time,
      median_time,
      ping_count,
      pings,
    },
  };
}
