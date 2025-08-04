import { QueryResult } from 'pg';
import { EncryptResult, encrypt } from '../../util/crypto-util';
import { PostgresClient } from '../db/postgres-client';
import { KeychainKeyDto } from '../models/keychain-key-dto';

export class KeychainService {
  static async insertKeychainKey(keychainKey: string, passwordId: string) {
    let colNames: string[];
    let colNamesStr: string;
    let colNumsStr: string;

    let queryStr: string;
    let queryParams: [ string, string, string ];
    let queryRes: QueryResult;

    let encryptedKeychainKey: EncryptResult;

    encryptedKeychainKey = encrypt(keychainKey);

    colNames = [
      'key_text',
      'iv',
      'password_id',
    ];
    colNamesStr = colNames.join(', ');
    colNumsStr = colNames.map((col_name, idx) => {
      return `$${idx + 1}`;
    }).join(', ');
    queryStr = `
      insert into keychain (${colNamesStr}) values(${colNumsStr}) returning *
    `;
    queryParams = [
      encryptedKeychainKey.text,
      encryptedKeychainKey.iv,
      passwordId,
    ];

    queryRes = await PostgresClient.query(queryStr, queryParams);
    return queryRes;
  }

  static async getKeychainKeys(): Promise<KeychainKeyDto[]> {
    let queryStr: string;
    let queryRes: QueryResult;
    let keychainKeyDtos: KeychainKeyDto[];
    queryStr = `
      select k.key_id, k.key_text, k.iv, k.password_id, u.user_id from keychain k 
        left join passwords p 
        on k.password_id = p.password_id
          left join users u 
          on u.user_id = p.user_id 
    `;
    queryRes = await PostgresClient.query(queryStr);
    keychainKeyDtos = queryRes.rows.map(KeychainKeyDto.deserialize);
    return keychainKeyDtos;
  }
}
