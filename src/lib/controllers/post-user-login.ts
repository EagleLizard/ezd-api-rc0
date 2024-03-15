
import { Request, Response } from 'express';
import { isString } from '../../util/validate-primitives';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function postUserLogin(req: Request, res: Response) {
  let userName: string;
  let passwordStr: string;
  let user: UserDto | undefined;
  let token: string | undefined;

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
    token,
  });
}

export async function postUserLogin2(
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
