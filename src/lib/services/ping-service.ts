
import { getISOString } from '../../util/datetime-util';
import { isNumber, isString } from '../../util/validate-primitives';
import { PostgresClient } from '../db/postgres-client';
import { PingAddrDto } from '../models/ping-addr-dto';
import { InsertPingOpts, PingDto } from '../models/ping-dto';
import { PingStatDto } from '../models/ping-stat-dto';

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

  static async getPingStats(): Promise<PingStatDto[]> {
    let queryStr: string;
    let pingStatDtos: PingStatDto[];
    queryStr = `
      select date_trunc('minute', p.created_at) as time_bucket,
        count(p.ping_id),
        round(avg(p."time")*1000)/1000 as avg,
        max(p."time"),
        percentile_cont(0.5) within group (order by p.time) as median
      from ping p 
      group by time_bucket
      order by time_bucket desc
    `;
    const queryRes = await PostgresClient.query(queryStr);
    pingStatDtos = queryRes.rows.map((row) => {
      return PingStatDto.deserialize(row);
    });
    return pingStatDtos;
  }

  static async getPings(params: GetPingsParams): Promise<GetPingsResult> {
    let pingDtos: PingDto[];
    let lastPing: PingDto;
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

    lastPing = await this.getLastPing();

    let lastPingTimestamp = getISOString(lastPing.created_at);
    
    queryParts = [
      'select * from ping p',
      `where p.created_at BETWEEN
        '${lastPingTimestamp}'::timestamp - INTERVAL '${startParam.value} ${startParam.unit}'
        AND
        '${lastPingTimestamp}'::timestamp`,
      `order by p.created_at`,
      `limit 1000`,
    ];
    queryStr = queryParts.join(' ');
    const queryRes = await PostgresClient.query(queryStr);
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

  static async getLastPing(): Promise<PingDto> {
    let pingDto: PingDto;
    let queryStr: string;
    queryStr = `
      select * from ping p
      order by p.created_at desc
      limit 1
    `;
    const queryRes = await PostgresClient.query(queryStr);
    pingDto = PingDto.deserialize(queryRes.rows[0]);
    return pingDto;
  }

  static async insertPing(opts: InsertPingOpts) {
    let srcAddrId: number | undefined;
    let addrId: number | undefined;

    let col_names: string[];
    let col_names_str: string;
    let col_nums_str: string;

    let queryStr: string;
    let queryParams: [ number, number, number, number, number, number, string ];

    srcAddrId = await this.getAddrIdByVal(opts.src_addr);
    if(srcAddrId === undefined) {
      srcAddrId = await this.insertAddr(opts.src_addr);
    }
    addrId = await this.getAddrIdByVal(opts.addr);
    if(addrId === undefined) {
      addrId = await this.insertAddr(opts.addr);
    }

    col_names = [
      'src_addr_id',
      'bytes',
      'addr_id',
      'seq',
      'ttl',
      'time',
      'time_unit',
    ];
    col_nums_str = col_names.map((col_name, idx) => {
      return `$${idx + 1}`;
    }).join(', ');
    col_names_str = col_names.join(', ');
    queryStr = `INSERT INTO ping (${col_names_str}) VALUES(${col_nums_str})`;
    queryParams = [
      srcAddrId,
      opts.bytes,
      addrId,
      opts.seq,
      opts.ttl,
      opts.time,
      opts.time_unit,
    ];
    return PostgresClient.query(queryStr, queryParams);
  }

  static async getAddrIdByVal(addr: string): Promise<number | undefined> {
    let addrDto = await this.getAddrByVal(addr);
    return addrDto?.ping_addr_id;
  }

  static async getAddrByVal(addr: string): Promise<PingAddrDto | undefined> {
    let addrQueryRes = await PostgresClient.query([
      'select * from ping_addr pa',
      `where pa.addr = '${addr}'`,
    ].join(' '));
    return addrQueryRes.rows[0] === undefined
      ? undefined
      : PingAddrDto.deserialize(addrQueryRes.rows[0])
    ;
  }

  static async insertAddr(addr: string): Promise<number> {
    let rawAddrId: number | undefined;
    let insertQueryRes = await PostgresClient.query([
      'insert into ping_addr (addr) values($1)  returning *'
    ].join(' '), [
      addr,
    ]);
    rawAddrId = insertQueryRes.rows[0]?.ping_addr_id;
    if(!isNumber(rawAddrId)) {
      throw new Error(`could not insert addr: ${addr}`);
    }
    return rawAddrId;
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
