
import { Client } from 'pg';
import { config } from '../../config';


export  class PostgresClient {
  static async getClient() {
    const client = new Client({
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
    });
    await client.connect();
    return client;
  }
}
