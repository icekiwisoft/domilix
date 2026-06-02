import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { NewslettersService } from './newsletters.service';

/**licorne pour la newsletter */
@ApiTags('Newsletters')
@Controller()
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post('newsletters')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Subscribe an email to the newsletter' })
  store(@Body() dto: CreateNewsletterDto) {
    return this.newslettersService.store(dto);
  }

  @Get('newsletter/:token')
  @ApiOperation({ summary: 'Verify newsletter subscription token' })
  @ApiParam({ name: 'token', example: 'uuid-token' })
  verify(@Param('token') token: string) {
    return this.newslettersService.verify(token);
  }
}
