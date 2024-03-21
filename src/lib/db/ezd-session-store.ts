
import { SessionData, Store } from 'express-session';
import { SessionDto } from '../models/session-dto';
import { PostgresClient } from './postgres-client';
import { QueryResult } from 'pg';
import { logger } from '../logger';
// 60 seconds * 60 minutes * 24 hours
const ONE_DAY = 60 * 60 * 24;
const SESSION_EXPIRE_DEFAULT = ONE_DAY;

const noop = (_err?: unknown, _data?: any) => {}

export class EzdSessionStore extends Store {
  async get(sid: string, cb = noop) {
    let sessionDto: SessionDto | undefined;
    try {
      sessionDto = await getSession(sid);
    } catch(e) {
      return cb(e);
    }
    if(sessionDto === undefined) {
      return cb();
    }
    return cb(null, sessionDto.sess);
  }

  async set(sid: string, sess: SessionData, cb = noop) {
    let expireTime: number;
    expireTime = getExpireTime(sess);
    try {
      await insertSession(sid, sess, expireTime);
    } catch(e) {
      return cb(e);
    }
    return cb();
  }

  async destroy(sid: string, cb = noop) {
    try {
      await deleteSession(sid);
    } catch(e) {
      return cb(e);
    }
    return cb();
  }
}

async function deleteSession(sid: string) {
  let queryStr: string;
  queryStr = `
    delete from sessions s where s.sid = $1
  `;
  return await PostgresClient.query(queryStr, [
    sid,
  ]);
}

async function getSession(sid: string): Promise<SessionDto | undefined> {
  let queryStr: string;
  let queryParams: [ string, number ];
  let sessionDto: SessionDto;
  queryStr = `
    select * from sessions s
      where s.sid = $1
        and s.expire >= to_timestamp($2)
  `;
  queryParams = [
    sid,
    Math.floor(Date.now() / 1000),
  ];
  let queryRes = await PostgresClient.query(queryStr, queryParams);
  if(queryRes.rows[0] === undefined) {
    return;
  }
  try {
    sessionDto = SessionDto.deserialize(queryRes.rows[0]);
  } catch(e) {
    console.error(e);
    logger.error(e);
    throw e;
  }
  return sessionDto;
}

async function insertSession(sid: string, sess: SessionData, expireTime: number) {
  /*
    INSERT INTO ' + this.quotedTable() + ' (sess, expire, sid) SELECT $1, to_timestamp($2), $3 ON CONFLICT (sid) DO UPDATE SET sess=$1, expire=to_timestamp($2) RETURNING sid'
  */
  let queryStr: string;
  let queryParams: [string, string, number];

  let queryRes: QueryResult;

  queryStr = `
    insert into sessions (sid, sess, expire) select $1, $2, to_timestamp($3)
      on conflict (sid) do update set sess=$2, expire=to_timestamp($3)
    returning sid
  `;
  queryParams = [
    sid,
    JSON.stringify(sess),
    expireTime,
  ];
  queryRes = await PostgresClient.query(queryStr, queryParams);
  return queryRes;
}

function getExpireTime(sess: SessionData): number {
  let expireTime: number;
  expireTime = (
    (sess?.cookie?.expires === undefined)
    || (sess?.cookie?.expires === null)
  )
    ? Math.ceil((Date.now() / 1000) + SESSION_EXPIRE_DEFAULT)
    : Math.ceil(
      (new Date(sess.cookie.expires)).valueOf() / 1000
    )
  ;
  return expireTime;
}
