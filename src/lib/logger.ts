
import path from 'path';

import pino from 'pino';
import { FastifyBaseLogger, FastifyLoggerOptions } from 'fastify/types/logger';

import { config } from '../config';
import { LOG_DIR_PATH } from '../constants';

const APP_LOG_FILE_NAME = 'app.log';
const APP_LOG_FILE_PATH = [
  LOG_DIR_PATH,
  APP_LOG_FILE_NAME,
].join(path.sep);

const APP_ERROR_LOG_FILE_NAME = 'app.error.log';
const APP_ERROR_LOG_FILE_PATH = [
  LOG_DIR_PATH,
  APP_ERROR_LOG_FILE_NAME,
].join(path.sep);

const level = (config.ENVIRONMENT === 'development')
  ? 'debug'
  : 'info'
;

export const logger = initLogger();

/*
  see: https://github.com/fastify/fastify/blob/ac462b2b4d859e88d029019869a9cb4b8626e6fd/lib/logger.js
*/
function initLogger() {
  let opts: FastifyLoggerOptions;
  // let stream = pino.destination('./logs/app2.log');
  let streams = [
    {
      stream: pino.destination(APP_LOG_FILE_PATH),
    },
    {
      stream: pino.destination(APP_ERROR_LOG_FILE_PATH),
      level: 'error',
    },
    // {
    //   stream: process.stdout,
    //   level: 'debug',
    // },
    {
      stream: process.stderr,
      level: 'error',
    },
  ];
  let stream = pino.multistream(streams);
  opts = {
    stream,
    level,
  };
  let logger2: FastifyBaseLogger = pino(opts, opts.stream);
  return logger2;
}
