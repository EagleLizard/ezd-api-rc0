
import { FastifyReply, FastifyRequest } from 'fastify';

import { isString } from '../../util/validate-primitives';
import { UserService } from '../services/user-service';
import { PG_ERRORS, PG_ERROR_ENUM } from '../db/postgres-constants';
import { ValidationError } from '../models/error/validation-error';

export async function registerUser(
  req: FastifyRequest<{
    Body: {
      userName?: string;
      email?: string;
      password?: string;
    };
  }>,
  rep: FastifyReply
) {
  let userName: string;
  let email: string;
  let password: string;
  if(
    !isString(req.body.userName)
    || !isString(req.body.email)
    || !isString(req.body.password)
  ) {
    rep.code(403);
    return
  }
  userName = req.body.userName;
  email = req.body.email;
  password = req.body.password;
  let registerUserRes = await UserService.registerUser(userName, email, password);
  if(registerUserRes !== undefined) {
    let errMessage: string;
    let pgError: PG_ERROR_ENUM | undefined;
    errMessage = 'Error creating user';
    if(
      isString(registerUserRes.code)
      && ((pgError = PG_ERRORS[registerUserRes.code]) !== undefined)
    ) {
      switch(pgError) {
        case PG_ERROR_ENUM.DUPLICATE_VALUE:
          errMessage = `Username '${userName}' already exists.`;
          break;
      }
    } else {
      if(registerUserRes instanceof ValidationError) {
        errMessage = registerUserRes.message;
      }
    }
    rep.code(403)
    return {
      errMessage,
    };
  }
  rep.code(200);
}
