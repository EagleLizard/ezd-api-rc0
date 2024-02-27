import { z } from 'zod';

/*
  ping_id
  src_addr
  bytes
  addr
  seq
  ttl
  time
  time_unit
  created_at
*/

const PingDtoSchema = z.object({
  ping_id: z.string(),
  src_addr: z.string(),
  bytes: z.number(),
  addr: z.string(),
  seq: z.number(),
  ttl: z.number(),
  time: z.number(),
  time_unit: z.string(),
  created_at: z.date(),
});

type PingDtoType = z.infer<typeof PingDtoSchema>;

export class PingDto implements PingDtoType {
  constructor(
    public ping_id: string,
    public src_addr: string,
    public bytes: number,
    public addr: string,
    public seq: number,
    public ttl: number,
    public time: number,
    public time_unit: string,
    public created_at: Date,
  ) {}

  static deserialize(rawPing: unknown): PingDto {
    let parsedPing: PingDto;
    parsedPing = PingDtoSchema.parse(rawPing);
    return new PingDto(
      parsedPing.ping_id,
      parsedPing.src_addr,
      parsedPing.bytes,
      parsedPing.addr,
      parsedPing.seq,
      parsedPing.ttl,
      parsedPing.time,
      parsedPing.time_unit,
      parsedPing.created_at,
    );
  }
}



