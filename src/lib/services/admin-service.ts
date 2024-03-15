import { config } from '../../config';

export class AdminService {
  static emailIsAdmin(email: string): boolean {
    return validateUserEmailIsAdmin(email);
  }
}

function validateUserEmailIsAdmin(email: string): boolean {
  let isAdmin: boolean;
  isAdmin = (
    email.startsWith(config.EZD_ADMIN_EMAIL)
    || email.startsWith(`${config.EZD_ADMIN_EMAIL}+`)
  );
  return isAdmin;
}
