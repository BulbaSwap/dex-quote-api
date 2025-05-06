import { TradeType } from '@bulbaswap/sdk-core';
import { createZodDto } from 'nestjs-zod';
import { isAddress } from 'viem';
import { z } from 'zod';

enum TradeTypeRequest {
  EXACT_INPUT = '0',
  EXACT_OUTPUT = '1',
  EXACT_IN = 'exactIn',
  EXACT_OUT = 'exactOut',
  BUY = 'buy',
  SELL = 'sell',
}

export const tradeTypeObj = {
  [TradeTypeRequest.EXACT_INPUT]: TradeType.EXACT_INPUT,
  [TradeTypeRequest.EXACT_IN]: TradeType.EXACT_INPUT,
  [TradeTypeRequest.BUY]: TradeType.EXACT_INPUT,
  [TradeTypeRequest.EXACT_OUTPUT]: TradeType.EXACT_OUTPUT,
  [TradeTypeRequest.EXACT_OUT]: TradeType.EXACT_OUTPUT,
  [TradeTypeRequest.SELL]: TradeType.EXACT_OUTPUT,
}

export enum Protocols {
  V2 = 'v2',
  V3 = 'v3',
  MIXED = 'v2,v3',
}

const address = z.union([
  z.literal('eth'),
  z.literal('weth'),
  z.literal('ETH'),
  z.literal('WETH'),
  z.custom<string>((value) => isAddress(value, { strict: false }), "Invalid Address"),
]);

const min = 1;
const max = 2**256;

export const QuoteSchema = z.object({
  amount: z.coerce.number().int().positive(),
  tokenInAddress: address,
  tokenOutAddress: address,
  type: z.nativeEnum(TradeTypeRequest),
  slippage: z.coerce.number().min(0.01).max(100).optional().nullable(),
  protocols: z.nativeEnum(Protocols).optional().nullable(),
  recipient: z.custom<string>((value) => isAddress(value, { strict: false }), "Invalid Address").optional().nullable(),
  deadline: z.coerce.number().int().positive().min(60).max(3600).optional().nullable(),
  minSplits: z.coerce.number().int().positive().min(1).max(7).optional().nullable(),
  permitSignature: z.string().optional().nullable(),
  permitNonce: z.coerce.number().int().optional().nullable(),
  permitExpiration: z.coerce.number().int().positive().optional().nullable(),
  permitAmount: z.coerce.number().int().positive().optional().nullable(),
  permitSigDeadline: z.coerce.number().int().positive().optional().nullable(),
});

export class QuoteDto extends createZodDto(QuoteSchema) {}
