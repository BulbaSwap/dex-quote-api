import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { UseZodGuard } from 'nestjs-zod';
import { QuoteService } from './quote.service';
import { QuoteDto, QuoteSchema, FastQuoteDto, FastQuoteSchema } from './quote.dto';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  @UseZodGuard('query', QuoteSchema)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(2 * 1000)
  quote(@Query() quoteDto: QuoteDto) {
    return this.quoteService.quote(quoteDto);
  }

  @Get('fast')
  @UseZodGuard('query', FastQuoteSchema)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1 * 1000) // 1 second cache for fast quote
  fastQuote(@Query() fastQuoteDto: FastQuoteDto) {
    return this.quoteService.fastQuote(fastQuoteDto);
  }
}
