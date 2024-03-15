
import { FastifyReply, FastifyRequest } from 'fastify';

import { isString } from '../../util/validate-primitives';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth-service';

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
