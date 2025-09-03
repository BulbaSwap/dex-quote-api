import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { UseZodGuard } from 'nestjs-zod';
import { QuoteService } from './quote.service';
import { QuoteDto, QuoteSchema } from './quote.dto';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  @UseZodGuard('query', QuoteSchema)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1 * 1000)
  quote(@Query() quoteDto: QuoteDto) {
    return this.quoteService.quote(quoteDto);
  }
}
