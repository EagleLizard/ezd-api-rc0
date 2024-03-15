import { FastifyReply, FastifyRequest } from 'fastify';
import { isString } from '../../util/validate-primitives';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service';

export async function getUser(
  req: FastifyRequest<{
    Params: {
      userId?: string;
    };
  }>,
  rep: FastifyReply
) {
  let userId: string;
  let user: UserDto | undefined;
  if(!isString(req.params.userId)) {
    rep.code(403);
    return;
  }
  userId = req.params.userId;
  user = await UserService.getUser(userId);
  if(user === undefined) {
    rep.code(403);
    return;
  }
  rep.code(200);
  return user;
}
