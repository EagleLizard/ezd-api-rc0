
import dotenv from 'dotenv';
import { isString } from './util/validate-primitives';
dotenv.config();

const DEFAULT_PORT = 4444;

const config = {
  port: getPort(),
  POSTGRES_HOST: process.env.POSTGRES_HOST ?? 'localhost',
  POSTGRES_PORT: getPostgresPort(),
  ENVIRONMENT: process.env.ENVIRONMENT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  SESSION_SECRET: getSessionSecret(),
  EZD_JWT_SECRET: getJwtSecret(),
  EZD_WEB_ORIGIN: getEzdWebOrigin(),
  EZD_ADMIN_EMAIL: getEnvVarOrErr('EZD_ADMIN_EMAIL'), 
  EZD_ENCRYPTION_SECRET: getEnvVarOrErr('EZD_ENCRYPTION_SECRET'),
};

export {
  config,
};

function getEnvVarOrErr(envKey: string): string {
  let rawEnvVar: string | undefined;
  rawEnvVar = process.env[envKey];
  if(!isString(rawEnvVar)) {
    throw new Error(`Invalid ${envKey}`);
  }
  return rawEnvVar;
}

function getSessionSecret(): string {
  let rawSessionSecret: unknown;
  rawSessionSecret = process.env.SESSION_SECRET;
  if(!isString(rawSessionSecret)) {
    throw new Error('Invalid SESSION_SECRET');
  }
  return rawSessionSecret;
}

function getEzdWebOrigin(): string {
  let rawOrigin: unknown;
  rawOrigin = process.env.EZD_WEB_ORIGIN;
  if(!isString(rawOrigin)) {
    throw new Error('Invalid EZD_WEB_ORIGIN');
  }
  return rawOrigin;
}

function getJwtSecret(): string {
  let rawSecret: unknown;
  rawSecret = process.env.EZD_JWT_SECRET;
  if(!isString(rawSecret)) {
    throw new Error(`Invalid EZD_JWT_SECRET`);
  }
  return rawSecret;
}

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
