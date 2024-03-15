
import { Request, Response } from 'express';

import { AuthService } from '../services/auth-service';
import { isString } from '../../util/validate-primitives';
import { UserService } from '../services/user-service';
import { UserDto } from '../models/user-dto';
import { JwtSessionDto } from '../models/jwt-session-dto';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function postUserAuth(req: Request, res: Response) {
  let token: string | undefined;
  let userName: string;
  let passwordStr: string;
  let user: UserDto | undefined;

  if(
    !isString(req.body.userName)
    || !isString(req.body.password)
  ) {
    res.status(403).send();
    return;
  }
  userName = req.body.userName;
  passwordStr = req.body.password;
  user = await UserService.authenticateUser(userName, passwordStr);
  if(user === undefined) {
    res.status(403).send();
    return;
  }
  token = await AuthService.createJwtSession(user);
  if(token === undefined) {
    res.status(403).send();
    return;
  }
  res.status(200).send({
    result: token,
  });
}

export async function postUserAuthVerify(req: Request, res: Response) {
  let token: string;
  let jwtSession: JwtSessionDto | undefined;

  if(!isString(req.body.token)) {
    res.status(403).send();
    return;
  }
  token = req.body.token;

  jwtSession = await AuthService.verifyJwtSession(token);
  if(jwtSession === undefined) {
    res.status(403).send();
    return;
  }
  if(!jwtSession.valid) {
    res.status(401).send();
    return;
  }
  res.status(200).send();
}

export async function postUserAuth2(
  req: FastifyRequest<{
    Body: {
      userName?: string;
      password?: string;
    };
  }>,
  rep: FastifyReply
) {
  let token: string | undefined;
  let userName: string;
  let passwordStr: string;
  let user: UserDto | undefined;

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
  rep.code(200)
  return {
    result: token,
  };
}

export async function postUserAuthVerify2(
  req: FastifyRequest<{
    Body: {
      token?: string;
    };
  }>,
  rep: FastifyReply
) {
  let token: string;
  let jwtSession: JwtSessionDto | undefined;

  if(!isString(req.body.token)) {
    rep.code(403);
    return;
  }
  token = req.body.token;

  jwtSession = await AuthService.verifyJwtSession(token);
  if(jwtSession === undefined) {
    rep.code(403);
    return;
  }
  if(!jwtSession.valid) {
    rep.code(401);
    return;
  }
  rep.code(200);
}
