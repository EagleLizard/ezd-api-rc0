
import { describe, it, expect } from 'vitest';
import { validateEmailAddress, validatePassword, validateUserName } from './input-validation';

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

const VALID_USERNAMES = [
  'a_Username3', // starts with a letter, includes an underscore and a number
  'Username', // simple alphabetic username
  'user_1_name', // includes underscores and a number
  'Alpha123', // mixed alphanumeric
  'Zeta_Gamma', // includes an underscore
  'Omega_42', // mixed alphanumeric with underscore
  'BetaDelta99', // mixed alphanumeric
  'user__name', // double underscore
  'Charlie007', // alphanumeric with leading letter
  'Echo_Foxtrot', // underscore with letters
  'GolfHotel_123', // mixed with underscore in the middle
  'IndiaJuliet3', // mixed alphanumeric
  'Kilo_456', // underscore with numbers at the end
  'Lima_Mike', // two words separated by underscore
  'November77', // alphanumeric
  'OscarPapa_8', // mixed with underscore
  'QuebecRomeo', // simple alphabetic
  'SierraTango2020', // alphanumeric
  'Uniform_999', // underscore with numbers
  'VictorWhiskey_X' // underscore with a letter at the end
];


const INVALID_USERNAMES = [
  '_username', // starts with an underscore
  '2username', // starts with a number
  'user@name', // contains an illegal character
  'na', // too short
  ' ', // blank space, too short, does not start with a letter
  'username$', // contains an illegal character
  'User Name', // contains a space
  'username!', // contains an illegal character
  '@user_name', // starts with an illegal character
  '99_red_balloons', // starts with numbers
  'user-name', // contains a hyphen
  '', // empty string
  'alpha*beta', // contains an asterisk
  'gamma/delta', // contains a slash
  'epsilon+eta', // contains a plus
  'theta=iotakappa', // contains an equals sign
  'lambda,lambda', // contains a comma
  '.mu', // starts with a dot
  'nu#', // contains a hash
  'xi%omicron', // contains a percent sign
  'pi;rho' // contains a semicolon
];

const VALID_PASSWORDS = [
  'Password123!', // Valid: Includes uppercase, lowercase, digit, special character
  'Longpassword1$', // Valid: More than 7 characters, includes a digit and special character
  'HelloWorld$7', // Valid: Mix of different character types
  '@ValidPass9', // Valid: Starts with a special character
  'Sunshine_90', // Valid: Includes an underscore, which is a special character
  'Summer2024!', // Valid: Includes digits and a special character
  'Spring@2024', // Valid: Includes a special character and digits
  'Passw0rd&', // Valid: Combination of character types
  'FallingLeaves2023@', // Valid: Longer phrase with special character and digits
  'G00dM0rn!ng', // Valid: Includes special character and digits
  'HappyDay123#', // Valid: Includes special character and digits
  'Secure*9876', // Valid: Includes special character and digits
  'Password!23', // Valid: Common base word with a special character and digits
  'Unique_Value123!', // Valid: Mix of characters including special ones
  'BrilliantDay2024!', // Valid: Long with digits and special character
  'Fantastic_4_You!', // Valid: Includes underscores as special characters
  'Welcome2024$', // Valid: Includes digits and special character
  'ValidPassword2024#',// Valid: Meets all criteria
  'special$$$$', // Invalid: No digits
  'AutumnLeaves$', // Invalid: Longer than 7 characters with a special character, no number
  'WinterIsComing!', // Invalid: Phrase with special character, longer than 7 characters, no number
];

const INVALID_PASSWORDS = [
  'short1', // Invalid: Too short
  '1234567', // Invalid: All digits and too short
  'password', // Invalid: No digits or special character and just at the limit
  'PASSWORD', // Invalid: Uppercase only and no special characters or digits
  'abc!@#', // Invalid: Too short despite having special characters
  'abcdefgh', // Invalid: No digits or special characters
  '12345678', // Invalid: All digits, no letters or special characters
  '!!!!!!!', // Invalid: All special characters, no letters or digits
  'passWORD', // Invalid: No digits or special characters
  'onlylowercase', // Invalid: Only lowercase letters
  'ONLYUPPERCASE', // Invalid: Only uppercase letters
  'Lower123', // Invalid: Just meets the length but no special characters
  'UPPER123', // Invalid: No special characters
  '1234567890', // Invalid: All digits
  '________', // Invalid: Only underscores
  'passwordpassword', // Invalid: No digits or special characters
  '!@#$%^&*', // Invalid: Only special characters
  'NoSpecials1', // Invalid: No special characters
  'Short7', // Invalid: Too short
  'NoNumsOrSpecs', // Invalid: No numbers or special characters
];

describe('Input Validation', () => {
  describe('Email addresses', () => {
    describe('Test valid email addresses', () => {
      VALID_EMAILS.forEach(email => {
        it(`test: ${email}`, () => {
          let validEmail: Error | undefined;
          validEmail = validateEmailAddress(email);
          expect(validEmail).toBe(undefined);
        })
      });
    });
    describe('Test invalid email addresses', () => {
      INVALID_EMAILS.forEach(email => {
        it(`test: ${email}`, () => {
          let validEmail: Error | undefined;
          validEmail = validateEmailAddress(email);
          expect(validEmail).toBeInstanceOf(Error);
        })
      });
    });
  });
  describe('UserNames', () => {
    describe('Test valid userNames', () => {
      VALID_USERNAMES.forEach(userName => {
        it(`test: ${userName}`, () => {
          let validUserName: Error | undefined;
          validUserName = validateUserName(userName);
          expect(validUserName).toBe(undefined);
        })
      });
    });
    describe('Test invalid userNames', () => {
      INVALID_USERNAMES.forEach(userName => {
        it(`test: ${userName}`, () => {
          let validUserName: Error | undefined;
          validUserName = validateUserName(userName);
          expect(validUserName).toBeInstanceOf(Error);
        })
      });
    });
  });
  describe('Passswords', () => {
    describe('Test valid passwords', () => {
      VALID_PASSWORDS.forEach(password => {
        it(`test: ${password}`, () => {
          let validPassword: Error | undefined;
          validPassword = validatePassword(password);
          expect(validPassword).toBe(undefined);
        })
      });
    });
    describe('Test invalid passwords', () => {
      INVALID_PASSWORDS.forEach(password => {
        it(`test: ${password}`, () => {
          let invalidPassword: Error | undefined;
          invalidPassword = validatePassword(password);
          expect(invalidPassword).toBeInstanceOf(Error);
        })
      });
    });
  });
});
