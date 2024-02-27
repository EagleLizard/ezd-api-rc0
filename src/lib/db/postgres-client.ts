
import { Pool } from 'pg';
import { config } from '../../config';

const pgPool = new Pool({
  host: config.POSTGRES_HOST,
  port: config.POSTGRES_PORT,
  user: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
})
export  class PostgresClient {
  static async getClient() {
    const client = await pgPool.connect();
    return client;
  }
}
