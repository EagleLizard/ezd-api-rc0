
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install();

import { initServer } from './server';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  setProcName();
  await initServer();
}

function setProcName() {
  process.title = 'ezd-api';
}
