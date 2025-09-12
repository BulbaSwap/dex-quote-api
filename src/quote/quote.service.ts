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
import BigNumber from 'bignumber.js';
import { QuoteDto, QuoteSpeed, tradeTypeObj } from './quote.dto';
import { tokenInfo } from 'src/token';
import { getQuoteRoute } from 'src/lib/router';
import { PROTOCOLS } from 'src/consts';
import { parseDeadline, parseSlippageTolerance } from 'src/lib';
import { QUOTE_SPEED_CONFIG } from 'src/config';

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
      amount: new BigNumber(quote.amount).toFixed(),
      tradeType,
    };
    let minSplits = 1;
    if (quote.quoteSpeed === QuoteSpeed.STANDARD && quote.minSplits) {
      minSplits = quote.minSplits;
    }
    const protocols: Protocol[] = (
      quote.protocols?.includes(',')
        ? PROTOCOLS
        : quote.protocols
          ? [quote.protocols.toUpperCase()]
          : PROTOCOLS
    ) as Protocol[];
    const routingConfig: AlphaRouterConfig = {
      ...QUOTE_SPEED_CONFIG[quote.quoteSpeed],
      minSplits,
      forceCrossProtocol: false,
      protocols,
      forceMixedRoutes: protocols.includes(Protocol.MIXED),
    };

    const chainId = this.configService.get('CHAIN_ID');

    const swapParams: SwapOptions = {
      type: SwapType.UNIVERSAL_ROUTER,
      slippageTolerance: parseSlippageTolerance(
        quote.slippage ? quote.slippage.toString() : '0.5',
      ),
      deadlineOrPreviousBlockhash: parseDeadline(
        quote.deadline ? quote.deadline.toString() : '300',
      ),
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

    try {
      const quoteResponse = await getQuoteRoute(
        args,
        swapParams,
        routingConfig,
      );

      if (quoteResponse) {
        return quoteResponse;
      } else {
        this.logger.log(`Route not found: ${JSON.stringify(quote)}`);
        throw new NotFoundException();
      }
    } catch (error) {
      this.logger.error(`quoteResponse error: ${JSON.stringify(error)}`);
      this.logger.error('error', error);
      throw new NotFoundException();
    }
  }
}
