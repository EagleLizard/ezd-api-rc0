
import { getISOString } from '../../util/datetime-util';
import { isNumber, isString } from '../../util/validate-primitives';
import { PostgresClient } from '../db/postgres-client';
import { ADDR_TYPE_ENUM, PingAddrDto } from '../models/ping-addr-dto';
import { TimeBucketUnit } from '../models/ping-args';
import { InsertPingOpts, PingDto } from '../models/ping-dto';
import { PingStatDto } from '../models/ping-stat-dto';
import { NetService } from './net-service';

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
  limit?: number | undefined;
};

type GetPingStatsParams = {
  addrType?: ADDR_TYPE_ENUM;
  bucketVal?: number;
  bucketUnit?: TimeBucketUnit;
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

  static async getPingStats(params: GetPingStatsParams = {}): Promise<PingStatDto[]> {
    let timeBucketQuery: GetTimeBucketQueryResult;
    let pingStatDtos: PingStatDto[];
    timeBucketQuery = getTimeBucketQuery({
      addrType: params.addrType,
      dateBinVal: params.bucketVal,
      dateBinUnit: params.bucketUnit,
    });
    const queryRes = await PostgresClient.query(
      timeBucketQuery.query,
      timeBucketQuery.queryParams,
    );

    pingStatDtos = queryRes.rows.map((row) => {
      return PingStatDto.deserialize(row);
    });
    return pingStatDtos;
  }

  static async getAddrPingStats(addrId: string) {
    let timeBucketQuery: GetTimeBucketQueryResult;
    let pingStatDtos: PingStatDto[];
    timeBucketQuery = getTimeBucketQuery({
      addrId,
    });

    const queryRes = await PostgresClient.query(
      timeBucketQuery.query,
      timeBucketQuery.queryParams,
    );
    pingStatDtos = queryRes.rows.map(PingStatDto.deserialize);
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

  static async getPingsByAddr(addrId: string): Promise<PingDto[]> {
    let pingDtos: PingDto[];
    let queryStr: string;
    queryStr = `
      select * from ping p
        where p.addr_id = $1
    `;
    const queryRes = await PostgresClient.query(queryStr, [ addrId ]);
    pingDtos = queryRes.rows.map(PingDto.deserialize);
    return pingDtos;
  }

  static async getAddrs(): Promise<PingAddrDto[]> {
    let addrDtos: PingAddrDto[];
    let queryStr: string;
    queryStr = `
      select * from ping_addr
    `;
    const queryRes = await PostgresClient.query(queryStr);
    addrDtos = queryRes.rows.map(PingAddrDto.deserialize);
    return addrDtos;
  }

  static async getAddrById(id: string): Promise<PingAddrDto> {
    let addrDto: PingAddrDto;
    let queryStr: string;
    queryStr = `
      select * from ping_addr p
        where p.ping_addr_id = $1
    `;
    const queryRes = await PostgresClient.query(queryStr, [ id ]);
    addrDto = PingAddrDto.deserialize(queryRes.rows[0]);
    return addrDto;
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
    let queryStr: string;
    let queryParams: [ string, ADDR_TYPE_ENUM ]
    let rawAddrId: number | undefined;
    let addr_type: ADDR_TYPE_ENUM;

    let col_names: string[];
    let col_names_str: string;
    let col_nums_str: string;

    addr_type = NetService.getNetworkType(addr);

    col_names = [
      'addr',
      'addr_type',
    ];
    col_names_str = col_names.join(', ');
    col_nums_str = col_names.map((col_name, idx) => {
      return `$${idx + 1}`;
    }).join(', ');
    queryStr = `
      insert into ping_addr (${col_names_str}) values(${col_nums_str})  returning *
    `;
    queryParams = [
      addr,
      addr_type,
    ];
    let insertQueryRes = await PostgresClient.query(queryStr, queryParams);
    rawAddrId = insertQueryRes.rows[0]?.ping_addr_id;
    if(!isNumber(rawAddrId)) {
      throw new Error(`could not insert addr: ${addr}`);
    }
    return rawAddrId;
  }
}

type GetTimeBucketQueryOpts = {
  addrId?: string;
  addrType?: ADDR_TYPE_ENUM;
  dateBinVal?: number;
  dateBinUnit?: TimeBucketUnit;
  start?: Date,
};

type GetTimeBucketQueryResult = {
  query: string;
  queryParams: (number | string)[];
};

function getTimeBucketQuery(opts: GetTimeBucketQueryOpts): GetTimeBucketQueryResult {
  let timeBucketQueryRes: GetTimeBucketQueryResult;
  let queryStr: string;
  let dateBinVal: number;
  let dateBinUnit: TimeBucketUnit;
  let baseQuery: string;
  let queryStrParts: string[];
  let startQueryStr: string;

  let queryParams: (number | string)[];
  let hasWhereClause: boolean;

  queryParams = [];

  dateBinVal = opts.dateBinVal ?? 5;
  dateBinUnit = opts.dateBinUnit ?? 'min';
  baseQuery = `
    select date_bin('${dateBinVal} ${dateBinUnit}', p.created_at, '2001-9-11') as time_bucket,
      count(p.ping_id),
      round(avg(p."time")*1000)/1000 as avg,
      max(p."time"),
      percentile_cont(0.5) within group (order by p.time) as median
    from ping p
  `;
  queryStrParts = [
    baseQuery,
  ];

  hasWhereClause = false;

  if(opts.addrType !== undefined) {
    queryParams.push(opts.addrType)
    queryStrParts.push(`
      left join ping_addr pr on pr.ping_addr_id = p.addr_id
        where pr.addr_type = $${queryParams.length}
    `);
    hasWhereClause = true;
  } else if(opts.addrId !== undefined) {
    queryParams.push(opts.addrId);
    queryStrParts.push(`
      where p.addr_id = $${queryParams.length}
    `);
    hasWhereClause = true;
  }

  if(opts.start !== undefined) {
    queryParams.push(
      getISOString(opts.start)
    );
    startQueryStr = (hasWhereClause)
      ? 'AND '
      : 'WHERE '
    ;
    startQueryStr += `
      p.created_at >= $${queryParams.length}
    `
  }
  queryStrParts.push(`
    group by time_bucket
    order by time_bucket desc
  `);

  queryStr = queryStrParts.join('\n');

  console.log(queryStr);
  console.log(queryParams);

  timeBucketQueryRes = {
    query: queryStr,
    queryParams,
  };

  return timeBucketQueryRes;
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
  return startParam;
}
