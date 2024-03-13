
import crypto, { pbkdf2Sync } from 'crypto';
import { PostgresClient } from '../db/postgres-client';
import { isObject, isString } from '../../util/validate-primitives';
import { PASSWORD_HASH_ALGO, PASSWORD_HASH_ITERATIONS, PASSWORD_HASH_KEYLEN } from '../../constants';
import { PasswordDto } from '../models/password-dto';
import { UserDto } from '../models/user-dto';
import { QueryResult } from 'pg';
import { validateEmailAddress } from '../../util/input-validation';
import { ValidationError } from '../models/error/validation-error';

export class UserService {

  static async authenticateUser(userName: string, passwordStr: string): Promise<UserDto | undefined> {
    let user: UserDto | undefined;
    let password: PasswordDto;
    let passwordValid: boolean;

    user = await UserService.getUserByName(userName);
    if(user === undefined) {
      return;
    }
    password = await UserService.getPasswordByUserId(user.user_id);
    passwordValid = UserService.checkPassword(passwordStr, password);
    if(!passwordValid) {
      return undefined;
    }
    return user;
  }

  static async getUserByName(userName: string): Promise<UserDto | undefined> {
    let userDto: UserDto;
    let queryStr: string;
    queryStr = `
      select * from users u
        where u.user_name = $1
    `;
    let queryRes = await PostgresClient.query(queryStr, [ userName ]);
    if(queryRes.rows[0] === undefined) {
      return;
    }
    userDto = UserDto.deserialize(queryRes.rows[0]);
    return userDto;
  }

  static async getPasswordByUserId(userId: string): Promise<PasswordDto> {
    let passwordDto: PasswordDto;
    let queryStr: string;
    queryStr = `
      select * from passwords p
        where p.user_id = $1
        order by p.created_at
        limit 1
    `;
    let queryRes = await PostgresClient.query(queryStr, [ userId ]);
    passwordDto = PasswordDto.deserialize(queryRes.rows[0]);
    return passwordDto;
  }

  static checkPassword(password: string, passwordDto: PasswordDto): boolean {
    return validatePassword(password, passwordDto);
  }

  static async registerUser(userName: string, email: string, password: string) {
    let userId: string;
    let passwordDto: PasswordDto;
    try {
      userId = await this.createUser(userName, email);
    } catch(e) {
      if(
        isObject(e)
        && isString(e.code)
        && (e.code === '23505')
      ) {
        return e;
      }
      if(e instanceof ValidationError) {
        return e;
      }
      throw e;
    }
    passwordDto = await this.createPassword(userId, password);
    console.log({
      passwordDto,
    });
  }

  static async createPassword(userId: string, password: string) {
    let queryStr: string;
    let colNames: string[];
    let colNums: string[];
    let colNamesStr: string;
    let colNumsStr: string;
    let queryParams: [string, string, string];

    let salt: string;
    let password_hash: string;
    let passwordDto: PasswordDto;

    salt = crypto.randomBytes(128).toString('base64');
    password_hash = pbkdf2Sync(
      password,
      salt,
      PASSWORD_HASH_ITERATIONS,
      PASSWORD_HASH_KEYLEN,
      PASSWORD_HASH_ALGO,
    ).toString('base64');

    colNames = [
      'user_id',
      'password_hash',
      'salt',
    ];
    colNums = colNames.map((colName, idx) => {
      return `$${idx + 1}`;
    });
    colNamesStr = colNames.join(', ');
    colNumsStr = colNums.join(', ');
    queryStr = `
      insert into passwords (${colNamesStr}) VALUES(${colNumsStr}) returning *
    `;
    queryParams = [
      userId,
      password_hash,
      salt,
    ];

    let queryRes = await PostgresClient.query(queryStr, queryParams);
    passwordDto = PasswordDto.deserialize(queryRes.rows[0]);
    return passwordDto;
  }

  static async createUser(userName: string, email: string) {
    let queryStr: string;
    let colNames: string[];
    let colNums: string[];
    let colNamesStr: string;
    let colNumsStr: string;
    let queryParams: [ string, string ];

    let validEmailErr = validateEmailAddress(email);

    if(validEmailErr !== undefined) {
      throw validEmailErr;
    }

    let queryRes: QueryResult;
    colNames = [
      'user_name',
      'email',
    ];
    colNums = colNames.map((colName, idx) => {
      return `$${idx + 1}`;
    });
    colNamesStr = colNames.join(', ');
    colNumsStr = colNums.join(', ');
    queryStr = `
      insert into users (${colNamesStr}) VALUES(${colNumsStr}) returning *
    `;
    queryParams = [
      userName,
      email,
    ];
    queryRes = await PostgresClient.query(queryStr, queryParams);
    if(!isString(queryRes.rows[0]?.user_id)) {
      throw new Error(`Unable to create user: '${userName}'`);
    }
    return queryRes.rows[0].user_id;
  }
}

function validatePassword(password: string, passwordDto: PasswordDto): boolean {
  let passwordHash: string;
  passwordHash = pbkdf2Sync(
    password,
    passwordDto.salt,
    PASSWORD_HASH_ITERATIONS,
    PASSWORD_HASH_KEYLEN,
    PASSWORD_HASH_ALGO,
  ).toString('base64');

  return passwordHash === passwordDto.password_hash;
}
