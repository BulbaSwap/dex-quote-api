import { ProtocolPoolSelection } from '@bulbaswap/smart-order-router';
import { QuoteSpeed } from 'src/quote/quote.dto';

type QuoteSpeedConfig = {
  v2PoolSelection: ProtocolPoolSelection
  v3PoolSelection: ProtocolPoolSelection
  maxSwapsPerPath: number
  maxSplits: number
  distributionPercent: number
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
    maxSwapsPerPath: 2,
    maxSplits: 7,
    distributionPercent: 25,
  },
  fast: {
    v2PoolSelection: {
      topN: 1,
      topNDirectSwaps: 1,
      topNTokenInOut: 1,
      topNSecondHop: 0,
      topNWithEachBaseToken: 1,
      topNWithBaseToken: 1,
    },
    v3PoolSelection: {
      topN: 1,
      topNDirectSwaps: 1,
      topNTokenInOut: 1,
      topNSecondHop: 0,
      topNWithEachBaseToken: 1,
      topNWithBaseToken: 1,
    },
    maxSwapsPerPath: 2,
    maxSplits: 1,
    distributionPercent: 100,
  },
}