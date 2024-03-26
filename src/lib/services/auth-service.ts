
import jwt from 'jsonwebtoken';

import { config } from '../../config';
import { isString } from '../../util/validate-primitives';
import { JwtSessionDto } from '../models/jwt-session-dto';
import { UserDto } from '../models/user-dto';
import { PostgresClient } from '../db/postgres-client';

export class AuthService {
  static async createJwtSession(user: UserDto): Promise<string | undefined> {
    let jwtSession: JwtSessionDto;
    let queryStr: string;
    let colNames: string[];
    let colNums: string[];
    let colNamesStr: string;
    let colNumsStr: string;
    let queryParams: [ string ];
    let token: string;

    colNames = [
      'user_id',
    ];
    colNums = colNames.map((colName, idx) => {
      return `$${idx + 1}`;
    });
    colNamesStr = colNames.join(', ');
    colNumsStr = colNums.join(', ');
    queryStr = `
      insert into jwt_sessions (${colNamesStr}) VALUES(${colNumsStr}) returning *
    `;

    queryParams = [
      user.user_id,
    ];

    let queryRes = await PostgresClient.query(queryStr, queryParams);
    jwtSession = JwtSessionDto.deserialize(queryRes.rows[0]);

    let payload = {
      user_id: user.user_id,
      user_name: user.user_name,
      jwt_session_id: jwtSession.jwt_session_id,
    };
    token = AuthService.getToken(payload);

    return token;
  }

  static async verifyJwtSession(token: string): Promise<jwt.JwtPayload | undefined> {
    let jwtSession: JwtSessionDto | undefined;
    let jwtPayload: jwt.JwtPayload | undefined;
    jwtPayload = await AuthService.verifyToken(token);
    if(
      (jwtPayload === undefined)
      || (jwtPayload.jwt_session_id === undefined)
    ) {
      return;
    }
    jwtSession = await AuthService.getJetSession(jwtPayload.jwt_session_id);
    if(!jwtSession?.valid) {
      return;
    }
    return jwtPayload;
  }

  static async getJetSession(jwtSessionId: number): Promise<JwtSessionDto | undefined> {
    let jwtSession: JwtSessionDto;

    let queryStr: string;
    let queryParams: [ number ];

    queryStr = `
      select * from jwt_sessions js
        where js.jwt_session_id = $1
    `;
    queryParams = [
      jwtSessionId,
    ];
    let queryRes = await PostgresClient.query(queryStr, queryParams);
    if(queryRes.rows[0] === undefined) {
      return;
    }
    jwtSession = JwtSessionDto.deserialize(queryRes.rows[0]);
    return jwtSession;
  }

  static getToken(payload: string | object | Buffer, opts?: jwt.SignOptions) {
    let token: string;
    let jwtOpts: jwt.SignOptions;
    jwtOpts = {
      ...opts,
    };
    if(jwtOpts.expiresIn === undefined) {
      // jwtOpts.expiresIn = '12h';
      jwtOpts.expiresIn = '2h';
    }
    token = jwt.sign(payload, config.EZD_JWT_SECRET, jwtOpts);
    return token;
  }
  static async verifyToken(token: string) {
    let jwtPayload: jwt.JwtPayload; 
    let jwtPromise: Promise<jwt.JwtPayload>;
    jwtPromise = new Promise((resolve, reject) => {
      jwt.verify(token, config.EZD_JWT_SECRET, (err, decoded) => {
        if(err) {
          reject(err);
          return;
        }
        if(decoded === undefined) {
          reject(new Error('Jwt payload undefined'));
          return;
        }
        if(isString(decoded)) {
          reject(new Error(`Expected object, received string: ${decoded}`));
          return;
        }
        resolve(decoded);
      });
    });
    try {
      jwtPayload = await jwtPromise;
    } catch (e) {
      return;
    }
    return jwtPayload;
  }
}
