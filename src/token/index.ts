import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { NATIVE_ADDRESS } from 'src/lib/router';

export async function tokenInfo(address: string) {
  if (NATIVE_ADDRESS.includes(address.toLowerCase())) {
    return {
      symbol: 'WETH',
      decimals: 18,
      address: '0x5300000000000000000000000000000000000011'
    }
  }
  try {
    const url = `${process.env.API_URL}/tokens/search/${address.toLowerCase()}`;
    const res = await axios.get(url);
    if (res?.data?.code == 200 && res?.data?.data?.[0]) {
      const result = res.data.data[0];
      return {
        symbol: result.symbol,
        decimals: result.decimals,
        address: result.address,
      }
    }
    throw new BadRequestException(`Token: ${address} not found`);
  } catch (error) {
    throw new BadRequestException(`Token: ${address} not found`);
  }
}
