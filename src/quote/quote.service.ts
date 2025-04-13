import { PermitSingle } from '@bulbaswap/permit2-sdk';
import { Protocol } from '@bulbaswap/router-sdk';
import {
  AlphaRouterConfig,
  SwapOptions,
  SwapType,
} from '@bulbaswap/smart-order-router';
import { UNIVERSAL_ROUTER_ADDRESS } from '@bulbaswap/universal-router-sdk';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuoteDto, tradeTypeObj } from './quote.dto';
import { tokenInfo } from 'src/token';
import { getQuoteRoute } from 'src/lib/router';
import { parseDeadline, parseSlippageTolerance } from 'src/lib';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  constructor(private configService: ConfigService) {}

  async quote(quote: QuoteDto) {
    const inToken = await tokenInfo(quote.tokenInAddress);
    const outToken = await tokenInfo(quote.tokenOutAddress);
    const tradeType = tradeTypeObj[quote.type];
    const args = {
      tokenInAddress: inToken.address,
      tokenInDecimals: Number(inToken.decimals),
      tokenInSymbol: inToken.symbol,
      tokenOutAddress: outToken.address,
      tokenOutDecimals: Number(outToken.decimals),
      tokenOutSymbol: outToken.symbol,
      amount: quote.amount.toString(),
      tradeType,
    };
    const protocols: Protocol[] = (
      quote.protocols?.includes(',')
        ? ['V2', 'V3']
        : quote.protocols
          ? [quote.protocols.toUpperCase()]
          : ['V2', 'V3']
    ) as Protocol[];
    const routingConfig: AlphaRouterConfig = {
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
        topNTokenInOut: 3,
        topNSecondHop: 1,
        topNWithEachBaseToken: 3,
        topNWithBaseToken: 5,
      },
      maxSwapsPerPath: 3,
      minSplits: quote.minSplits ? quote.minSplits : 1,
      maxSplits: 7,
      distributionPercent: 5,
      forceCrossProtocol: false,
      protocols,
    };

    const chainId = this.configService.get('CHAIN_ID');

    const swapParams: SwapOptions = {
      type: SwapType.UNIVERSAL_ROUTER,
      slippageTolerance: parseSlippageTolerance(quote.slippage.toString()),
      deadlineOrPreviousBlockhash: quote.deadline
        ? parseDeadline(quote.deadline.toString())
        : undefined,
      recipient: quote.recipient,
    };

    if (
      quote.permitSignature &&
      quote.permitNonce &&
      quote.permitExpiration &&
      quote.permitAmount &&
      quote.permitSigDeadline
    ) {
      const permit: PermitSingle = {
        details: {
          token: inToken.address,
          amount: quote.permitAmount,
          expiration: quote.permitExpiration,
          nonce: quote.permitNonce,
        },
        spender: UNIVERSAL_ROUTER_ADDRESS(Number(chainId)),
        sigDeadline: quote.permitSigDeadline,
      };

      swapParams.inputTokenPermit = {
        ...permit,
        signature: quote.permitSignature,
      };
    }

    const quoteResponse = await getQuoteRoute(args, swapParams, routingConfig);

    if (quoteResponse) {
      return quoteResponse;
    } else {
      this.logger.log(`Route not found: ${quote}`);
      throw new NotFoundException();
    }
  }
}
