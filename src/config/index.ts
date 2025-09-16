import { ProtocolPoolSelection } from '@bulbaswap/smart-order-router';
import { QuoteSpeed } from 'src/quote/quote.dto';

type QuoteSpeedConfig = {
  v2PoolSelection: ProtocolPoolSelection
  v3PoolSelection: ProtocolPoolSelection
  maxSwapsPerPath: number
  maxSplits: number
  distributionPercent: number
  forceCrossProtocol: boolean
  forceMixedRoutes: boolean
  useCachedRoutes?: boolean
  writeToCachedRoutes?: boolean
}

export const QUOTE_SPEED_CONFIG: Record<QuoteSpeed, QuoteSpeedConfig> = {
  standard: {
    v2PoolSelection: {
      topN: 3,
      topNDirectSwaps: 1,
      topNTokenInOut: 5,
      topNSecondHop: 2,
      topNWithEachBaseToken: 2,
      topNWithBaseToken: 6,
    },
    v3PoolSelection: {
      topN: 2,
      topNDirectSwaps: 2,
      topNTokenInOut: 2,
      topNSecondHop: 1,
      topNWithEachBaseToken: 3,
      topNWithBaseToken: 2,
    },
    maxSwapsPerPath: 3,
    maxSplits: 7,
    distributionPercent: 5,
    forceCrossProtocol: false,
    forceMixedRoutes: false,
  },
  fast: {
    v2PoolSelection: {
      topN: 3,
      topNDirectSwaps: 2,
      topNTokenInOut: 3,
      topNSecondHop: 2,
      topNWithEachBaseToken: 2,
      topNWithBaseToken: 3,
    },
    v3PoolSelection: {
      topN: 2,
      topNDirectSwaps: 2,
      topNTokenInOut: 2,
      topNSecondHop: 1,
      topNWithEachBaseToken: 2,
      topNWithBaseToken: 2,
    },
    maxSwapsPerPath: 3,
    maxSplits: 4,
    distributionPercent: 10,
    forceCrossProtocol: false,
    forceMixedRoutes: false,
    useCachedRoutes: false,
    writeToCachedRoutes: false,
  },
}
