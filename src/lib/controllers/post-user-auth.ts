
import { FastifyReply, FastifyRequest } from 'fastify';

import { isString } from '../../util/validate-primitives';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';
import { JwtPayload } from 'jsonwebtoken';

export async function postUserVerify(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  let sessionId: string | undefined;
  let token: string | undefined;
  let tokenPayload: JwtPayload | undefined;
  let userId: string;
  let user: UserDto | undefined;

  /*
    A user is logged in if:
      1. they have a valid session
      2. they have a valid JWT
  */
  sessionId = req.session.sessionId;
  token = req.cookies['ezd-token'];

  if(
    !isString(sessionId)
    || !isString(token)
  ) {
    rep.code(403);
    return;
  }
  tokenPayload = await AuthService.verifyJwtSession(token);
  if(
    (tokenPayload === undefined)
    || !isString(tokenPayload.user_id)
  ) {
    // token is expired
    rep.code(200);
    return {
      result: false,
    };
  }
  user = await UserService.getUser(tokenPayload.user_id)

  if(user === undefined) {
    rep.code(403);
    return;
  }

  rep.code(200);
  return {
    result: {
      user,
      exp: tokenPayload.exp,
    }
  }
}

export async function postUserLogin(
  req: FastifyRequest<{
    Body: {
      userName?: string;
      password?: string;
    };
  }>,
  rep: FastifyReply
) {
  let userName: string;
  let passwordStr: string;
  let user: UserDto | undefined;
  let token: string | undefined;

  if(
    !isString(req.body.userName)
    || !isString(req.body.password)
  ) {
    rep.code(403);
    return;
  }
  userName = req.body.userName;
  passwordStr = req.body.password;
  user = await UserService.authenticateUser(userName, passwordStr);
  if(user === undefined) {
    rep.code(403);
    return;
  }
  token = await AuthService.createJwtSession(user);
  if(token === undefined) {
    rep.code(403);
    return;
  }
  // console.log('req.session.cookie');
  rep.cookie('ezd-token', token);
  rep.code(200);
  return {
    token,
  };
}
