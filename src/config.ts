
import dotenv from 'dotenv';
import { isString } from './util/validate-primitives';
dotenv.config();

const DEFAULT_PORT = 4444;

const config = {
  port: getPort(),
};

export {
  config,
};

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
