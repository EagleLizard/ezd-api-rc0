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
  ping_id: z.number().optional(),
  // src_addr: z.string(),
  src_addr_id: z.number(),
  bytes: z.number(),
  // addr: z.string(),
  addr_id: z.number(),
  seq: z.number(),
  ttl: z.number(),
  time: z.number(),
  time_unit: z.string(),
  created_at: z.date(),
});

type PingDtoType = z.infer<typeof PingDtoSchema>;

const InsertPingOptsSchema = PingDtoSchema.omit({
  ping_id: true,
  src_addr_id: true,
  addr_id: true,
  created_at: true,
}).extend({
  addr: z.string(),
  src_addr: z.string(),
});

type InsertPingOptsType = z.infer<typeof InsertPingOptsSchema>;

export class InsertPingOpts implements InsertPingOptsType {
  constructor(
    public addr: string,
    public src_addr: string,
    public bytes: number,
    public seq: number,
    public ttl: number,
    public time: number,
    public time_unit: string,
  ) {}

  static deserialize(rawOpts: unknown): InsertPingOpts {
    let parsedOpts: InsertPingOpts;
    parsedOpts = InsertPingOptsSchema.parse(rawOpts);
    return new InsertPingOpts(
      parsedOpts.addr,
      parsedOpts.src_addr,
      parsedOpts.bytes,
      parsedOpts.seq,
      parsedOpts.ttl,
      parsedOpts.time,
      parsedOpts.time_unit,
    );
  }
}

export class PingDto implements PingDtoType {
  constructor(
    public bytes: number,
    public seq: number,
    public ttl: number,
    public time: number,
    public time_unit: string,
    // public src_addr: string,
    public src_addr_id: number,
    // public addr: string,
    public addr_id: number,
    public created_at: Date,
    public ping_id?: number,
  ) {}

  static deserialize(rawPing: unknown): PingDto {
    let parsedPing: PingDto;
    parsedPing = PingDtoSchema.parse(rawPing);
    return new PingDto(
      parsedPing.bytes,
      parsedPing.seq,
      parsedPing.ttl,
      parsedPing.time,
      parsedPing.time_unit,
      parsedPing.src_addr_id,
      parsedPing.addr_id,
      parsedPing.created_at,
      parsedPing.ping_id,
    );
  }
}



