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
      // the process should not use more than 2G memory
      () =>
        this.memoryHealthIndicator.checkHeap('memory heap', 2000 * 1024 * 1024),
      // The process should not have more than 2G RSS memory allocated
      () =>
        this.memoryHealthIndicator.checkRSS('memory RSS', 2000 * 1024 * 1024),
    ]);
  }
}
