
import { describe, it, expect } from 'vitest';
import { validateEmailAddress } from './input-validation';

const VALID_EMAILS = [
  'simple@example.com',
  'very.common@example.com',
  'disposable.style.email.with+symbol@example.com',
  'other.email-with-hyphen@example.com',
  'fully-qualified-domain@example.com',
  'user.name+tag+sorting@example.com',
  'x@example.com', // one-letter local-part
  'example-indeed@strange-example.com',
  'test.email+alex@leetcode.com',
  'email@example.co.jp',
  'firstname.lastname@example.com',
  'email@subdomain.example.com',
  'firstname+lastname@example.com',
  // 'email@123.123.123.123', // Numeric domain name
  '1234567890@example.com', // Numeric local part
  'email@example-one.com', // Dash in domain name
  '_______@example.com', // Underscores in local part
  'email@example.name', // .name is a valid top level domain
  'email@example.museum', // .museum is a valid top level domain
  'email@example.co.kr', // Country code top level domain
  'firstname-lastname@example.com', // Dash in local part
]

const INVALID_EMAILS = [
  'asdlfkjasdlfk@asdff@asffas', // multiple @ symbols
  'plainaddress', // missing @ symbol and domain
  '@no-local-part.com', // missing local part
  'Outlook User<outlook_user@example.com>', // encoded html within email is invalid
  'john.doe@example..com', // double dot after @
  'a"b(c)d,e:f;g<h>i[j\\k]l@example.com', // special characters not allowed outside quotation marks
  'just"not"right@example.com', // quoted strings must be dot separated or the only element making up the local-part
  'this is"not\\allowed@example.com', // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
  'this\\ still\\"not\\\\allowed@example.com', // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
  'john..doe@example.com', // double dot before @
  '.john.doe@example.com', // leading dot in address is not allowed
  'john.doe.@example.com', // trailing dot in address is not allowed
  'john.doe@example..com', // multiple consecutive dots
  '“(),:;<>[\\]@example.com', // special characters are not allowed outside of quotation marks
  'just"not"right@example.com', // quoted strings must be dot separated, or the only element making up the local-part
  'abc@123.123.123.123', // IP address as domain, but not in square brackets
  'user@localserver', // lacking top level domain (.com, .net, .org, etc)
  'user@.invalid.com' // leading dot in domain part is invalid
];

describe('Input Validation', () => {
  describe('Test valid email addresses', () => {
    VALID_EMAILS.forEach(email => {
      it(`test: ${email}`, () => {
        let validEmail: Error | undefined;
        validEmail = validateEmailAddress(email);
        expect(validEmail).toBe(undefined);
      })
    });
  })
  describe('Test invalid email addresses', () => {
    INVALID_EMAILS.forEach(email => {
      it(`test: ${email}`, () => {
        let validEmail: Error | undefined;
        validEmail = validateEmailAddress(email);
        expect(validEmail).toBeInstanceOf(Error);
      })
    });
  })
});
