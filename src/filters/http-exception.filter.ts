import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Response } from 'express';
import { ZodSerializationException } from 'nestjs-zod';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: ZodSerializationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;
    let errors = null;
    if (exception.getZodError) {
      errors = exception.getZodError()
    }
    response.status(status).json({
      code: status,
      message,
      errors,
    });
  }
}
