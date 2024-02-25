
import dotenv from 'dotenv';
import { isString } from './util/validate-primitives';
dotenv.config();

const DEFAULT_PORT = 4444;

const config = {
  port: getPort(),
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: getPostgresPort(),
  ENVIRONMENT: process.env.ENVIRONMENT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
};

export {
  config,
};

function getPostgresPort(): number {
  let rawPort: unknown;
  rawPort = process.env.POSTGRES_PORT;
  if(
    isString(rawPort)
    && !isNaN(+rawPort)
  ) {
    return +rawPort;
  }
  throw new Error(`Invalid postgress port: ${rawPort}`);
}

function getPort(): number {
  let rawPort: unknown;
  rawPort = process.env.PORT;
  if(
    isString(rawPort)
    && !isNaN(+rawPort)
  ) {
    return +rawPort;
  }
  return DEFAULT_PORT;
}
