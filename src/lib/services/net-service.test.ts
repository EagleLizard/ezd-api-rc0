import { describe, it, expect } from 'vitest';
import { NetService } from './net-service';
import { ADDR_TYPE_ENUM } from '../models/ping-addr-dto';

const LOCAL_IP_ADDRS = [
  '10.0.0.1',
  '10.255.255.254',
  '10.128.0.1',
  '10.50.25.100',
  '172.16.0.1',
  '172.31.255.254',
  '172.20.10.5',
  '172.22.45.67',
  '192.168.0.1',
  '192.168.255.254',
  '192.168.100.100',
  '192.168.1.1',
  '10.1.1.1',
  '10.200.200.200',
  '172.16.100.100',
  '172.31.1.1',
  '192.168.50.50',
  '192.168.150.150',
  '10.10.10.10',
  '172.18.18.18'
];

const GLOBAL_IP_ADDRS = [
  '8.8.8.8',
  '1.1.1.1',
  '192.0.2.1',
  '203.0.113.1',
  '198.51.100.1',
  '172.32.0.1',
  '172.15.255.254',
  // '10.255.256.0', // Intentionally incorrect for boundary testing
  '192.169.0.1',
  '131.107.0.89',
  '56.45.255.5',
  '164.53.160.5',
  '99.88.77.66',
  '123.123.123.123',
  '222.222.222.222',
  // '168.192.0.1', // Intentionally incorrect for boundary testing
  '200.200.200.200',
  '172.14.255.255',
  '172.32.0.0',
  '192.167.255.255'
];

describe('NetService', () => {
  describe('Test local ip addresses', () => {
    LOCAL_IP_ADDRS.forEach(ipAddr => {
      it(`test: ${ipAddr}`, () => {
        let addrType: ADDR_TYPE_ENUM;
        addrType = NetService.getNetworkType(ipAddr);
        expect(addrType).toBe(ADDR_TYPE_ENUM.LOCAL);
      });
    });
  });
  describe('Test global ip addresses', () => {
    GLOBAL_IP_ADDRS.forEach(ipAddr => {
      it(`test: ${ipAddr}`, () => {
        let addrType: ADDR_TYPE_ENUM;
        addrType = NetService.getNetworkType(ipAddr);
        expect(addrType).toBe(ADDR_TYPE_ENUM.GLOBAL);
      });
    });
  });
});
