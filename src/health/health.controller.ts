import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      // the process should not use more than 600M memory
      () =>
        this.memoryHealthIndicator.checkHeap('memory heap', 600 * 1024 * 1024),
      // The process should not have more than 600M RSS memory allocated
      () =>
        this.memoryHealthIndicator.checkRSS('memory RSS', 600 * 1024 * 1024),
    ]);
  }
}
