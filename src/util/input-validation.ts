
import { ValidationError } from '../lib/models/error/validation-error';

export function validateEmailAddress(email: string): Error | undefined {
  let emailParts: string[]; 
  let localPart: string;
  let domainPart: string;
  emailParts = email.split('@');
  if(emailParts.length !== 2) {
    return new ValidationError(`Invalid email: '${email}'`);
  }
  // let localRx = /^(?!\.)[a-zA-Z_!#$%&'*+-/=?^_`{|}~]{1}(?:[a-zA-Z0-9_!#$%&'*+-/=?^_`{|}~]|[.]{1})*[a-zA-Z0-9_!#$%&'*+-/=?^_`{|}~]{0,1}$/;
  // let localRx = /^(?!\.)[a-zA-Z_!#$%&'*+-/=?^_`{|}~]{1}(?:[a-zA-Z0-9_!#$%&'*+-/=?^_`{|}~])*[a-zA-Z0-9_!#$%&'*+-/=?^_`{|}~]{0,1}$/;
  /*
    https://stackoverflow.com/a/46181
  */
  let localRx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))$/; 
  let domainRx = /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/;
  [ localPart, domainPart ] = emailParts;
  if(!localRx.test(localPart)) {
    return new ValidationError(`Invalid local part: '${localPart}'`);
  }
  if(!domainRx.test(domainPart)) {
    return new ValidationError(`Invalid domain part: '${domainPart}'`);
  }
}
