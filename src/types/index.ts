import { PermitTransferFromData } from "@bulbaswap/permit2-sdk"
import { Protocol } from "@bulbaswap/router-sdk"
import { Token, TradeType } from "@bulbaswap/sdk-core"
import { DutchOrderInfoJSON, UnsignedV2DutchOrderInfoJSON } from "@uniswap/uniswapx-sdk"

export const INTERNAL_ROUTER_PREFERENCE_PRICE = 'price' as const

export enum RouterPreference {
  X = 'uniswapx',
  API = 'api',
}

// From `DutchQuoteDataJSON` https://github.com/Uniswap/unified-routing-api/blob/main/lib/entities/quote/DutchQuote.ts
export type URADutchOrderQuoteData = {
  orderInfo: DutchOrderInfoJSON
  quoteId?: string
  requestId?: string
  encodedOrder: string
  orderHash: string
  startTimeBufferSecs: number
  auctionPeriodSecs: number
  deadlineBufferSecs: number
  slippageTolerance: string
  permitData: PermitTransferFromData
  portionBips?: number
  portionAmount?: string
  portionRecipient?: string
}

// From `DutchV2QuoteDataJSON` in https://github.com/Uniswap/unified-routing-api/blob/main/lib/entities/quote/DutchV2Quote.ts
export type URADutchOrderV2QuoteData = {
  orderInfo: UnsignedV2DutchOrderInfoJSON
  quoteId?: string
  requestId?: string
  encodedOrder: string
  orderHash: string
  deadlineBufferSecs: number
  slippageTolerance: string
  permitData: PermitTransferFromData
  portionBips?: number
  portionAmount?: string
  portionRecipient?: string
}

type URAClassicQuoteResponse = {
  routing: URAQuoteType.CLASSIC
  quote: ClassicQuoteData
  allQuotes: Array<URAQuoteResponse>
}

type URADutchOrderQuoteResponse = {
  routing: URAQuoteType.DUTCH_V1
  quote: URADutchOrderQuoteData
  allQuotes: Array<URAQuoteResponse>
}

type URADutchOrderV2QuoteResponse = {
  routing: URAQuoteType.DUTCH_V2
  quote: URADutchOrderV2QuoteData
  allQuotes: Array<URAQuoteResponse>
}

export type URAQuoteResponse = URAClassicQuoteResponse | URADutchOrderQuoteResponse | URADutchOrderV2QuoteResponse

export interface GetQuoteArgs {
  tokenInAddress: string
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutDecimals: number
  tokenOutSymbol?: string
  amount: string
  account?: string
  protocolPreferences?: Protocol[]
  tradeType: TradeType
}

export enum QuoteState {
  SUCCESS = 'Success',
  NOT_FOUND = 'Not found',
}

export type QuoteResult =
  | {
      code: number
      state: QuoteState.NOT_FOUND
      data?: undefined
    }
  | {
      code: number
      state: QuoteState.SUCCESS
      data: URAQuoteResponse
    }

// From `ClassicQuoteDataJSON` in https://github.com/Uniswap/unified-routing-api/blob/main/lib/entities/quote/ClassicQuote.ts
export interface ClassicQuoteData {
  requestId?: string
  quoteId?: string
  blockNumber: string
  amount: string
  amountDecimals: string
  gasPriceWei?: string
  gasUseEstimate?: string
  gasUseEstimateQuote?: string
  gasUseEstimateQuoteDecimals?: string
  gasUseEstimateUSD?: string
  methodParameters?: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  route: Array<(V3PoolInRoute | V2PoolInRoute)[]>
  routeString: string
  portionBips?: number
  portionRecipient?: string
  portionAmount?: string
  portionAmountDecimals?: string
  quoteGasAndPortionAdjusted?: string
  quoteGasAndPortionAdjustedDecimals?: string
}

export enum URAQuoteType {
  CLASSIC = 'CLASSIC',
  DUTCH_V1 = 'DUTCH_LIMIT', // "dutch limit" refers to dutch. Fully separate from "limit orders"
  DUTCH_V2 = 'DUTCH_V2',
}

export type TokenInRoute = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'> & {
  buyFeeBps?: string
  sellFeeBps?: string
}

type V2Reserve = {
  token: TokenInRoute
  quotient: string
}

export type V2PoolInRoute = {
  type: 'v2-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  reserve0: V2Reserve
  reserve1: V2Reserve
  amountIn?: string
  amountOut?: string

  // not used in the interface
  // avoid returning it from the client-side smart-order-router
  address?: string
}

export type V3PoolInRoute = {
  type: 'v3-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  sqrtRatioX96: string
  liquidity: string
  tickCurrent: string
  fee: string
  amountIn?: string
  amountOut?: string

  // not used in the interface
  address?: string
}

