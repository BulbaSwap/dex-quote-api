import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT')
              ? Number(configService.get('REDIS_PORT'))
              : 6379,
          },
          password: configService.get('REDIS_PASSWORD'),
          database: configService.get('REDIS_DATABASE')
            ? Number(configService.get('REDIS_DATABASE'))
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
