
import { Request, Response } from 'express';
import { PostgresClient } from '../db/postgres-client';
import { PingDto } from '../models/ping-dto';
import { isObject, isString } from '../../util/validate-primitives';

enum TIME_UNIT {
  MINUTE = 'MINUTE',
}

const TIME_UNIT_MAP: Record<TIME_UNIT, string> = {
  [TIME_UNIT.MINUTE]: 'MINUTES',
};

export async function getPings(req: Request, res: Response) {
  let pingDtos: PingDto[];
  let avgTime: number;
  let minTime: number;
  let maxTime: number;
  let halfTimeIdx: number;
  let medianTime: number;
  let pingCount: number;
  let times: number[];

  let startParam: StartParam | undefined;
  let startQueryUnit: string;
  let startQueryTime: number;

  const queryParams = req.query;
  const {
    start: rawStartParam,
  } = queryParams;
  if(rawStartParam !== undefined) {
    try {
      startParam = parseStartParam(rawStartParam);
    } catch(e) {
      let errMsg: string;
      errMsg = (isObject(e) && isString(e.message))
        ? e.message
        : `invalid start param: ${rawStartParam}`;
      ;
      res.status(400).send({
        error: errMsg,
      });
      return;
    }
  }

  startQueryTime = startParam?.value ?? 30;
  startQueryUnit = (startParam?.unit === undefined)
    ? TIME_UNIT_MAP.MINUTE
    : TIME_UNIT_MAP[startParam?.unit]
  ;

  const pgClient = await PostgresClient.getClient();
  const queryRes = await pgClient.query([
    'select * from ping p',
    `where p.created_at BETWEEN NOW() - INTERVAL '${startQueryTime} ${startQueryUnit}' AND NOW()`,
    `order by p.created_at`
  ].join(' '));
  pingDtos = queryRes.rows.map(PingDto.deserialize);
  pingCount = pingDtos.length;
  minTime = Infinity;
  maxTime = -Infinity;
  avgTime = pingDtos.reduce((acc, curr) => {
    if(curr.time_unit !== 'ms') {
      throw new Error(`unexpected time unit: ${curr.time_unit}`);
    }
    minTime = Math.min(minTime, curr.time);
    maxTime = Math.max(maxTime, curr.time);
    return acc + (curr.time / pingDtos.length);
  }, 0);
  times = pingDtos.map(pingDto => pingDto.time);
  times.sort((a, b) => {
    return a - b;
  });
  halfTimeIdx = Math.floor(times.length / 2);
  medianTime = ((times.length % 2) === 0)
    ? times[halfTimeIdx]
    : (times[halfTimeIdx - 1] + times[halfTimeIdx]) / 2
  ;
  res.status(200).send({
    result: {
      avg_time_ms: avgTime,
      min_time: minTime,
      max_time: maxTime,
      median_time: medianTime,
      ping_count: pingCount,
      pings: pingDtos,
    },
  });
}

type StartParam = {
  unit: TIME_UNIT;
  value: number;
};

function parseStartParam(rawStartParam: unknown): StartParam {
  let startParamRxResult: RegExpExecArray | null;
  let timeStr: string;
  let unitStr: string;
  let unit: TIME_UNIT;
  let time: number;
  let startParam: StartParam;
  if(!isString(rawStartParam)) {
    throw new Error(`unexpected 'start' query param type: ${typeof rawStartParam}, param: ${rawStartParam}`);
  }
  startParamRxResult = /^([0-9]+)([m]+)$/.exec(rawStartParam);
  if(
    (startParamRxResult === null)
    || (startParamRxResult[1] === undefined)
    || (startParamRxResult[2] === undefined)
  ) {
    throw new Error(`unexpected 'start' query param type: ${typeof rawStartParam}, param: ${rawStartParam}`);
  }
  timeStr = startParamRxResult[1];
  unitStr = startParamRxResult[2];
  switch(unitStr) {
    case 'm':
      unit = TIME_UNIT.MINUTE
      break;
    default:
      throw new Error(`unexpected 'start' query param type: ${typeof rawStartParam}, param: ${rawStartParam}`);
  }
  time = +timeStr;
  startParam = {
    unit,
    value: time,
  };
  console.log({
    startParam,
  });
  return startParam;
}
