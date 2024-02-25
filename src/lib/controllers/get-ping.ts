
import { Request, Response } from 'express';
import { PostgresClient } from '../db/postgres-client';

export async function getPings(req: Request, res: Response) {
  const pgClient = await PostgresClient.getClient();
  const queryRes = await pgClient.query('select * from ping p order by p.created_at desc limit 10');
  console.log(queryRes.rows[0]);
  res.status(200).send({
    rows: queryRes.rows,
  });
}
