import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { createLogger } from './logger';
import './instrument';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: createLogger(),
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('v1');
  app.enableCors();
  app.use(helmet());
  app.enableShutdownHooks();
  app.disable('x-powered-by');

  await app.listen(3000);
}
bootstrap();
