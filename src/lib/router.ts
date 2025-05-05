import NodeCache from 'node-cache';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Protocol } from '@bulbaswap/router-sdk';
import {
  BigintIsh,
  ChainId,
  Currency,
  CurrencyAmount,
  Token,
  TradeType,
} from '@bulbaswap/sdk-core';
import { Pair as V2Pair } from '@bulbaswap/v2-sdk';
import { Pool } from '@bulbaswap/v3-sdk';
import {
  AlphaRouter,
  AlphaRouterConfig,
  nativeOnChain,
  routeAmountsToString,
  SwapOptions,
  SwapRoute,
} from '@bulbaswap/smart-order-router';
import JSBI from 'jsbi';
import {
  ClassicQuoteData,
  GetQuoteArgs,
  V2PoolInRoute,
  V3PoolInRoute,
} from '../types';

export const NATIVE_ADDRESS = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'eth', '0x5300000000000000000000000000000000000011'];

export const PROTOCOLS = [Protocol.V2, Protocol.V3]
// export const PROTOCOLS = [Protocol.V2, Protocol.V3, Protocol.MIXED]

// from routing-api (https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/quote.ts#L243-L311)
export function transformSwapRouteToGetQuoteResult(
  tradeType: TradeType,
  amount: CurrencyAmount<Currency>,
  {
    quote,
    quoteGasAdjusted,
    route,
    estimatedGasUsed,
    estimatedGasUsedQuoteToken,
    estimatedGasUsedUSD,
    gasPriceWei,
    methodParameters,
    blockNumber,
  }: SwapRoute,
  recipient?: string,
): ClassicQuoteData {
  const routeResponse: Array<(V3PoolInRoute | V2PoolInRoute)[]> = [];

  for (const subRoute of route) {
    const { amount, quote, tokenPath } = subRoute;

    const pools =
      subRoute.protocol === Protocol.V2
        ? subRoute.route.pairs
        : subRoute.route.pools;
    const curRoute: (V3PoolInRoute | V2PoolInRoute)[] = [];
    for (let i = 0; i < pools.length; i++) {
      const nextPool = pools[i];
      const tokenIn = tokenPath[i];
      const tokenOut = tokenPath[i + 1];

      let edgeAmountIn = undefined;
      if (i === 0) {
        edgeAmountIn =
          tradeType === TradeType.EXACT_INPUT
            ? amount.quotient.toString()
            : quote.quotient.toString();
      }

      let edgeAmountOut = undefined;
      if (i === pools.length - 1) {
        edgeAmountOut =
          tradeType === TradeType.EXACT_INPUT
            ? quote.quotient.toString()
            : amount.quotient.toString();
      }

      if (nextPool instanceof Pool) {
        curRoute.push({
          type: 'v3-pool',
          tokenIn: {
            chainId: tokenIn.chainId,
            decimals: tokenIn.decimals,
            address: tokenIn.address,
            symbol: tokenIn.symbol,
          },
          tokenOut: {
            chainId: tokenOut.chainId,
            decimals: tokenOut.decimals,
            address: tokenOut.address,
            symbol: tokenOut.symbol,
          },
          fee: nextPool.fee.toString(),
          liquidity: nextPool.liquidity.toString(),
          sqrtRatioX96: nextPool.sqrtRatioX96.toString(),
          tickCurrent: nextPool.tickCurrent.toString(),
          amountIn: edgeAmountIn,
          amountOut: edgeAmountOut,
        });
      } else {
        const reserve0 = (nextPool as unknown as V2Pair).reserve0;
        const reserve1 = (nextPool as unknown as V2Pair).reserve1;

        curRoute.push({
          type: 'v2-pool',
          tokenIn: {
            chainId: tokenIn.chainId,
            decimals: tokenIn.decimals,
            address: tokenIn.address,
            symbol: tokenIn.symbol,
          },
          tokenOut: {
            chainId: tokenOut.chainId,
            decimals: tokenOut.decimals,
            address: tokenOut.address,
            symbol: tokenOut.symbol,
          },
          reserve0: {
            token: {
              chainId: reserve0.currency.wrapped.chainId,
              decimals: reserve0.currency.wrapped.decimals,
              address: reserve0.currency.wrapped.address,
              symbol: reserve0.currency.wrapped.symbol,
            },
            quotient: reserve0.quotient.toString(),
          },
          reserve1: {
            token: {
              chainId: reserve1.currency.wrapped.chainId,
              decimals: reserve1.currency.wrapped.decimals,
              address: reserve1.currency.wrapped.address,
              symbol: reserve1.currency.wrapped.symbol,
            },
            quotient: reserve1.quotient.toString(),
          },
          amountIn: edgeAmountIn,
          amountOut: edgeAmountOut,
        });
      }
    }

    routeResponse.push(curRoute);
  }

  const result: ClassicQuoteData = {
    methodParameters: recipient ? methodParameters : undefined,
    blockNumber: blockNumber.toString(),
    amount: amount.quotient.toString(),
    amountDecimals: amount.toExact(),
    quote: quote.quotient.toString(),
    quoteDecimals: quote.toExact(),
    quoteGasAdjusted: quoteGasAdjusted.quotient.toString(),
    quoteGasAdjustedDecimals: quoteGasAdjusted.toExact(),
    gasUseEstimateQuote: estimatedGasUsedQuoteToken.quotient.toString(),
    gasUseEstimateQuoteDecimals: estimatedGasUsedQuoteToken.toExact(),
    gasUseEstimate: estimatedGasUsed.toString(),
    gasUseEstimateUSD: estimatedGasUsedUSD.toExact(),
    gasPriceWei: gasPriceWei.toString(),
    route: routeResponse,
    routeString: routeAmountsToString(route),
  };

  return result;
}

function getRouter(): AlphaRouter {
  const chainId = Number(process.env.CHAIN_ID) as unknown as ChainId;
  const provider = new StaticJsonRpcProvider(process.env.RPC_URL);
  const router = new AlphaRouter({
    chainId,
    provider,
  });
  return router;
}

async function getQuote(
  {
    tradeType,
    tokenIn,
    tokenOut,
    amount: amountRaw,
  }: {
    tradeType: TradeType;
    tokenIn: {
      address: string;
      chainId: number;
      decimals: number;
      symbol?: string;
    };
    tokenOut: {
      address: string;
      chainId: number;
      decimals: number;
      symbol?: string;
    };
    amount: BigintIsh;
  },
  swapParams: SwapOptions,
  routerConfig: Partial<AlphaRouterConfig>,
): Promise<ClassicQuoteData> {
  const tokenInIsNative = NATIVE_ADDRESS.includes(tokenIn.address.toLowerCase());
  const tokenOutIsNative = NATIVE_ADDRESS.includes(tokenOut.address.toLowerCase());

  const chainId = Number(process.env.CHAIN_ID) as unknown as ChainId;
  const nativeToken = nativeOnChain(chainId)

  const currencyIn = tokenInIsNative
    ? nativeToken
    : new Token(
        tokenIn.chainId,
        tokenIn.address,
        tokenIn.decimals,
        tokenIn.symbol,
      );
  const currencyOut = tokenOutIsNative
    ? nativeToken
    : new Token(
        tokenOut.chainId,
        tokenOut.address,
        tokenOut.decimals,
        tokenOut.symbol,
      );

  const baseCurrency =
    tradeType === TradeType.EXACT_INPUT ? currencyIn : currencyOut;
  const quoteCurrency =
    tradeType === TradeType.EXACT_INPUT ? currencyOut : currencyIn;

  const amount = CurrencyAmount.fromRawAmount(
    baseCurrency,
    JSBI.BigInt(amountRaw),
  );
  const recipient = swapParams.recipient;
  const router = getRouter();
  const swapRoute = await router.route(
    amount,
    quoteCurrency,
    tradeType,
    swapParams,
    routerConfig,
  );

  if (!swapRoute) {
    return null;
  }
  return transformSwapRouteToGetQuoteResult(tradeType, amount, swapRoute, recipient);
}

export async function getQuoteRoute(
  {
    tokenInAddress,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutDecimals,
    tokenOutSymbol,
    amount,
    tradeType,
  }: GetQuoteArgs,
  swapParams: SwapOptions,
  routingConfig: Partial<AlphaRouterConfig>,
) {
  const chainId = Number(process.env.CHAIN_ID);
  return getQuote(
    {
      tradeType,
      tokenIn: {
        address: tokenInAddress,
        chainId,
        decimals: tokenInDecimals,
        symbol: tokenInSymbol,
      },
      tokenOut: {
        address: tokenOutAddress,
        chainId,
        decimals: tokenOutDecimals,
        symbol: tokenOutSymbol,
      },
      amount,
    },
    swapParams,
    routingConfig,
  );
}
