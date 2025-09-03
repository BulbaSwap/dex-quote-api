import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { redisStore } from 'cache-manager-redis-yet';
import { ZodValidationPipe } from 'nestjs-zod';

import { QuoteModule } from './quote/quote.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
              ? Number(process.env.REDIS_PORT)
              : 6379,
          },
          password: process.env.REDIS_PASSWORD,
          database: process.env.REDIS_DATABASE
            ? Number(process.env.REDIS_DATABASE)
            : 0,
        }),
      }),
    }),
    ConfigModule.forRoot(),
    HealthModule,
    QuoteModule,
    SentryModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
