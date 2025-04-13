import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';

@Module({
  imports: [ConfigModule],
  controllers: [QuoteController],
  providers: [QuoteService],
})
export class QuoteModule {}
