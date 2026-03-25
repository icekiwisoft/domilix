import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { NewslettersService } from './newsletters.service';

@ApiTags('Newsletters')
@Controller()
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Get('newsletters')
  @ApiOperation({ summary: 'List verified newsletter subscribers' })
  index() {
    return this.newslettersService.index();
  }

  @Post('newsletters')
  @ApiOperation({ summary: 'Subscribe an email to the newsletter' })
  store(@Body() dto: CreateNewsletterDto) {
    return this.newslettersService.store(dto);
  }

  @Get('newsletters/:id')
  @ApiOperation({ summary: 'Get newsletter subscriber by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@Param('id') id: string) {
    return this.newslettersService.show(id);
  }

  @Put('newsletters/:id')
  @ApiOperation({ summary: 'Update newsletter subscriber' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsletterDto) {
    return this.newslettersService.update(id, dto);
  }

  @Delete('newsletters/:id')
  @ApiOperation({ summary: 'Delete newsletter subscriber' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(@Param('id') id: string, @Res() res: any) {
    await this.newslettersService.destroy(id);
    return res.status(204).send();
  }

  @Get('newsletter/:token')
  @ApiOperation({ summary: 'Verify newsletter subscription token' })
  @ApiParam({ name: 'token', example: 'uuid-token' })
  verify(@Param('token') token: string) {
    return this.newslettersService.verify(token);
  }
}
