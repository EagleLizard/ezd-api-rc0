
import { FastifyRequest } from 'fastify';
import { UserRoleDto } from '../lib/models/user-role-dto';

declare module 'fastify' {
  interface FastifyRequest {
    etc?: string;
    user?: UserDto;
    userRole?: UserRoleDto;
  }
}
