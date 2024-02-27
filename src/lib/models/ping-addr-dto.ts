
import { z } from 'zod';

const PingAddrDtoSchema = z.object({
  ping_addr_id: z.number(),
  addr: z.string(),
});

type PingAddrDtoType = z.infer<typeof PingAddrDtoSchema>;

export class PingAddrDto implements PingAddrDtoType {
  constructor(
    public ping_addr_id: number,
    public addr: string,
  ) {}

  static deserialize(rawPingAddr: unknown): PingAddrDto {
    let parsedPingAddr: PingAddrDto;
    parsedPingAddr = PingAddrDtoSchema.parse(rawPingAddr);
    return new PingAddrDto(
      parsedPingAddr.ping_addr_id,
      parsedPingAddr.addr,
    );
  }
}
