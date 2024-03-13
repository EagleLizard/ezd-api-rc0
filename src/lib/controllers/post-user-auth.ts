
import { Request, Response } from 'express';

import { AuthService } from '../services/auth-service';
import { isString } from '../../util/validate-primitives';
import { UserService } from '../services/user-service';
import { UserDto } from '../models/user-dto';
import { JwtSessionDto } from '../models/jwt-session-dto';

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
