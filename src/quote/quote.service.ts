import { PermitSingle } from '@bulbaswap/permit2-sdk';
import { Protocol } from '@bulbaswap/router-sdk';
import {
  AlphaRouterConfig,
  SwapOptions,
  SwapType,
} from '@bulbaswap/smart-order-router';
import { UNIVERSAL_ROUTER_ADDRESS } from '@bulbaswap/universal-router-sdk';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { QuoteDto, QuoteSpeed, tradeTypeObj, FastQuoteDto } from './quote.dto';
import { getQuoteRoute } from 'src/lib/router';
import { NATIVE_ADDRESS, PROTOCOLS, WRAPPED_NATIVE_ADDRESS } from 'src/consts';
import { parseDeadline, parseSlippageTolerance } from 'src/lib';
import { QUOTE_SPEED_CONFIG } from 'src/config';

@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
  ) {}

  async tokenInfo(address: string) {
    if (NATIVE_ADDRESS.includes(address.toLowerCase())) {
      return {
        symbol: 'eth',
        decimals: 18,
        address: NATIVE_ADDRESS[0]
      }
    } else if (WRAPPED_NATIVE_ADDRESS.includes(address.toLowerCase())) {
      return {
        symbol: 'weth',
        decimals: 18,
        address: WRAPPED_NATIVE_ADDRESS[0]
      }
    }

    const cachedToken: { symbol: string, decimals: number, address: string } = await this.cacheManager.get(address.toLowerCase());
    if (cachedToken) {
      return cachedToken;
    }

    try {
      const url = `${this.configService.get('API_URL')}/tokens/search/${address.toLowerCase()}`;
      const res = await axios.get(url);
      if (res?.data?.code == 200 && res?.data?.data?.[0]) {
        const result = res.data.data[0];
        const token = {
          symbol: result.symbol,
          decimals: result.decimals,
          address: result.address,
        }
        this.cacheManager.set(address.toLowerCase(), token, 0);
        return token;
      }
      throw new BadRequestException(`Token: ${address} not found`);
    } catch (error) {
      throw new BadRequestException(`Quote token: ${address} error: ${error}`);
    }
  }

  async quote(quote: QuoteDto) {
    const [inToken, outToken] = await Promise.all([
      this.tokenInfo(quote.tokenInAddress),
      this.tokenInfo(quote.tokenOutAddress)
    ]);
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
    let protocols: Protocol[];
    if (quote.protocols?.includes(',')) {
      protocols = PROTOCOLS;
    } else if (quote.protocols) {
      protocols = [quote.protocols.toUpperCase()] as Protocol[];
    } else {
      protocols = PROTOCOLS;
    }
    const routingConfig: AlphaRouterConfig = {
      ...QUOTE_SPEED_CONFIG[quote.quoteSpeed],
      minSplits,
      protocols,
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

  async fastQuote(quote: FastQuoteDto) {
    const [inToken, outToken] = await Promise.all([
      this.tokenInfo(quote.tokenInAddress),
      this.tokenInfo(quote.tokenOutAddress)
    ]);
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

    const routingConfig: AlphaRouterConfig = {
      ...QUOTE_SPEED_CONFIG[QuoteSpeed.FAST],
      minSplits: 1,
    };

    const swapParams: SwapOptions = {
      type: SwapType.SWAP_ROUTER_02,
      slippageTolerance: parseSlippageTolerance(
        quote.slippage ? quote.slippage.toString() : '0.5',
      ),
      deadline: parseDeadline('300'), // Fixed deadline
      recipient: quote.recipient,
    };

    try {
      const quoteResponse = await getQuoteRoute(
        args,
        swapParams,
        routingConfig,
      );

      if (quoteResponse) {
        return quoteResponse;
      } else {
        this.logger.log(`Fast route not found: ${JSON.stringify(quote)}`);
        throw new NotFoundException();
      }
    } catch (error) {
      this.logger.error(`fastQuoteResponse error: ${JSON.stringify(error)}`);
      this.logger.error('error', error);
      throw new NotFoundException();
    }
  }
}
