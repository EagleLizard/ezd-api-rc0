
import { z } from 'zod';

export enum ADDR_TYPE_ENUM {
  LOCAL = 'local',
  GLOBAL = 'global',
}

const PingAddrDtoSchema = z.object({
  ping_addr_id: z.number(),
  addr: z.string(),
  created_at: z.coerce.date(),
  addr_type: z.enum([
    ADDR_TYPE_ENUM.LOCAL,
    ADDR_TYPE_ENUM.GLOBAL,
  ])
});

type PingAddrDtoType = z.infer<typeof PingAddrDtoSchema>;

export class PingAddrDto implements PingAddrDtoType {
  constructor(
    public ping_addr_id: number,
    public addr: string,
    public addr_type: ADDR_TYPE_ENUM,
    public created_at: Date,
  ) {}

  static deserialize(rawPingAddr: unknown): PingAddrDto {
    let parsedPingAddr: PingAddrDto;
    parsedPingAddr = PingAddrDtoSchema.parse(rawPingAddr);
    return new PingAddrDto(
      parsedPingAddr.ping_addr_id,
      parsedPingAddr.addr,
      parsedPingAddr.addr_type,
      parsedPingAddr.created_at,
    );
  }
}
