
import { isString } from '../../util/validate-primitives';
import { PostgresClient } from '../db/postgres-client';
import { PingAddrDto } from '../models/ping-addr-dto';
import { PingDto } from '../models/ping-dto';

export type GetPingsResult = {
  avg_time_ms: number;
  min_time: number;
  max_time: number;
  median_time: number;
  ping_count: number;
  pings: PingDto[]
}

type GetPingsParams = {
  start?: string | undefined;
};

type StartParam = {
  unit: TIME_UNIT;
  value: number;
};

export enum TIME_UNIT {
  MINUTE = 'MINUTE',
}

export const TIME_UNIT_MAP: Record<TIME_UNIT, string> = {
  [TIME_UNIT.MINUTE]: 'MINUTES',
};

export class PingService {

  static async getAddrByValue(addr: string): Promise<PingAddrDto | undefined> {
    let queryParts: string[];
    let queryStr: string;
    const pgClient = await PostgresClient.getClient();
    queryParts = [
      `select * from ping_addr pa`,
      `where pa.addr = '${addr}'`,
    ];
    queryStr = queryParts.join(' ');
    const queryRes = await pgClient.query(queryStr);
    return queryRes.rows[0];
  }

  static async getPings(params: GetPingsParams): Promise<GetPingsResult> {
    let pingDtos: PingDto[];
    let avgTime: number;
    let minTime: number;
    let maxTime: number;
    let halfTimeIdx: number;
    let medianTime: number;
    let pingCount: number;
    let times: number[];

    let startParam: StartParam;
    let queryParts: string[];
    let queryStr: string;
    startParam = (params.start === undefined)
      ? {
        unit: TIME_UNIT.MINUTE,
        value: 30,
      }
      : parseStartParam(params.start)
    ;
    const pgClient = await PostgresClient.getClient();
    queryParts = [
      'select * from ping p',
      `where p.created_at BETWEEN NOW() - INTERVAL '${startParam.value} ${startParam.unit}' AND NOW()`,
      `order by p.created_at`
    ];
    queryStr = queryParts.join(' ');
    const queryRes = await pgClient.query(queryStr);
    console.log('queryRes:');
    console.log(queryRes);
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
    const getPingsRes = {
      avg_time_ms: avgTime,
      min_time: minTime,
      max_time: maxTime,
      median_time: medianTime,
      ping_count: pingCount,
      pings: pingDtos,
    };
    return getPingsRes;
  }
}



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
