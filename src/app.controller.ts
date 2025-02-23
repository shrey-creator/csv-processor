import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  getHello(): string {
    return 'Nest API is running';
  }
}
