
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install();

import { initServer } from './server';
import { initServer2 } from './server2';
import { config } from './config';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  if(config.REST_FRAMEWORK === 'express') {
    await initServer();
  } else {
    await initServer2();
  }
}
