
import { Request, Response } from 'express';
import { isString } from '../../util/validate-primitives';
import { PasswordDto } from '../models/password-dto';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service';

export async function postUserLogin(req: Request, res: Response) {
  let userName: string;
  let passwordStr: string;
  let user: UserDto;
  let password: PasswordDto;
  let passwordValid: boolean;
  if(
    !isString(req.body.userName)
    || !isString(req.body.password)
  ) {
    res.status(403).send();
    return;
  }
  userName = req.body.userName;
  passwordStr = req.body.password;
  user = await UserService.getUserByName(userName);
  password = await UserService.getPasswordByUserId(user.user_id);
  console.log({
    user,
    password,
  });
  passwordValid = UserService.checkPassword(passwordStr, password);
  if(!passwordValid) {
    res.status(403).send();
    return;
  }
  res.status(200).send();
}
