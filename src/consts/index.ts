import { Protocol } from '@bulbaswap/router-sdk';

export const NATIVE_ADDRESS = [
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  'eth',
];

export const WRAPPED_NATIVE_ADDRESS = [
  '0x5300000000000000000000000000000000000011',
  'weth',
];

export const DEFAULT_TOKEN_LIST = {
  name: 'BulbaSwap Default Token List',
  timestamp: '2025-09-16T00:00:00.000Z',
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  tokens: [
    {
      chainId: 2818,
      address: '0x5300000000000000000000000000000000000011',
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0x5300000000000000000000000000000000000011.svg',
      tags: ['wrapped', 'ethereum'],
    },
    {
      chainId: 2818,
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ether',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.svg',
      tags: ['native'],
    },
    {
      chainId: 2818,
      address: '0xc7d67a9cbb121b3b0b9c053dd9f469523243379a',
      decimals: 6,
      symbol: 'USDT',
      name: 'Tether',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0xc7d67a9cbb121b3b0b9c053dd9f469523243379a.svg',
      tags: ['stablecoin'],
    },
    {
      chainId: 2818,
      address: '0xe34c91815d7fc18a9e2148bcd4241d0a5848b693',
      decimals: 6,
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0xe34c91815d7fc18a9e2148bcd4241d0a5848b693.svg',
      tags: ['stablecoin'],
    },
    {
      chainId: 2818,
      address: '0x803dce4d3f4ae2e17af6c51343040dee320c149d',
      decimals: 8,
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0x803dce4d3f4ae2e17af6c51343040dee320c149d.svg',
      tags: ['wrapped', 'bitcoin'],
    },
    {
      chainId: 2818,
      address: '0x55d1f1879969bdbb9960d269974564c58dbc3238',
      decimals: 18,
      symbol: 'BGB',
      name: 'BitgetToken',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0x55d1f1879969bdbb9960d269974564c58dbc3238.svg',
      tags: ['BGB'],
    },
    {
      chainId: 2818,
      address: '0xe2e7d83dfbd25407045fd061e4c17cc76007dead',
      decimals: 18,
      symbol: 'BAI',
      name: 'bAiFund',
      logoURI: 'https://assets.bulbaswap.io/icons/2818/address/0xe2e7d83dfbd25407045fd061e4c17cc76007dead.svg',
      tags: ['ai'],
    }
  ],
};

export const PROTOCOLS = [Protocol.V2, Protocol.V3];

// export const PROTOCOLS = [Protocol.V2, Protocol.V3, Protocol.MIXED]
