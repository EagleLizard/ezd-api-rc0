
import { Client, ClientConfig } from 'pg';
import { config } from '../../config';


export  class PostgresClient {
  static async getClient() {

    let pgClientConfig: ClientConfig;
    pgClientConfig = {
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
    };
    const client = new Client(pgClientConfig);
    await client.connect();
    return client;
  }
}
