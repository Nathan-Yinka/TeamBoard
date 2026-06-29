import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthCheck() {
    return { status: 'ok', service: 'teamboard-api', timestamp: new Date().toISOString() };
  }

  @Head()
  headHealthCheck() {
    return;
  }
}
