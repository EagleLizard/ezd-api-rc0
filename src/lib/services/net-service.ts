
import { ADDR_TYPE_ENUM } from '../models/ping-addr-dto';

export class NetService {

  /*
    Private IP address ranges
    The ranges and the amount of usable IP's are as follows:
    10.0.0.0 - 10.255.255.255 Addresses: 16,777,216
    172.16.0.0 - 172.31.255.255 Addresses: 1,048,576
    192.168.0.0 - 192.168.255.255 Addresses: 65,536
  */
  static getNetworkType(address: string): ADDR_TYPE_ENUM {
    let addrStrParts: string[];
    let addrParts: number[];
    addrStrParts = address.split('.');
    addrParts = addrStrParts.map(addrStrPart => {
      if(isNaN(+addrStrPart)) {
        throw new Error(`Invalid ip address: ${address}`);
      }
      return +addrStrPart;
    });

    if(
      (addrParts[0] === 10)
      || (
        (addrParts[0] === 172)
        && (addrParts[1] >= 16)
        && (addrParts[1] <= 31)
      )
      || (
        (addrParts[0] === 192)
        && (addrParts[1] === 168)
      )
    ) {
      return ADDR_TYPE_ENUM.LOCAL;
    }
    return ADDR_TYPE_ENUM.GLOBAL;
  }
}

