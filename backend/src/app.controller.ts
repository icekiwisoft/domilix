import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get public platform statistics' })
  @ApiOkResponse({ description: 'Global statistics payload' })
  getStats() {
    return this.appService.getStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check backend health status' })
  @ApiOkResponse({ description: 'Health status payload' })
  getHealth() {
    return this.appService.getHealth();
  }
}
