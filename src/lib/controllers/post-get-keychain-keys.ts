
import { FastifyReply, FastifyRequest } from 'fastify';
import { KeychainKeyDto } from '../models/keychain-key-dto';
import { KeychainService } from '../services/keychain-service';

export async function postGetKeychainKeys(
  req: FastifyRequest,
  rep: FastifyReply
) {
  let keychainKeys: KeychainKeyDto[];
  keychainKeys = await KeychainService.getKeychainKeys();

  console.log('req.user');
  console.log(req.user); // see: index.d.ts
  console.log('req.userRole');
  console.log(req.userRole); // see: index.d.ts

  rep.code(200);
  return {
    count: keychainKeys.length,
    result: keychainKeys,
  };
}
