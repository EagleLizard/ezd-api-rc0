
import path from 'path';

export enum EXIT_SIGNAL_CODE_ENUM {
  SIGINT = 'SIGINT',
  SIGTERM = 'SIGTERM',
  SIGQUIT = 'SIGQUIT',
}

export const EXIT_SIGNAL_CODES = [
  EXIT_SIGNAL_CODE_ENUM.SIGINT,
  EXIT_SIGNAL_CODE_ENUM.SIGTERM,
  EXIT_SIGNAL_CODE_ENUM.SIGQUIT,
];

export const PASSWORD_HASH_ITERATIONS = 1e5;
export const PASSWORD_HASH_KEYLEN = 64;
export const PASSWORD_HASH_ALGO = 'sha512';

export const BASE_DIR = path.resolve(__dirname, '..');

const LOG_DIR_NAME = 'logs';
export const LOG_DIR_PATH = [
  BASE_DIR,
  LOG_DIR_NAME,
].join(path.sep);
