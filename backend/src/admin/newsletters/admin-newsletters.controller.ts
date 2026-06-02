import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthGuard } from '../../auth/auth.guard';
import { QueryNewslettersDto } from '../../newsletters/dto/query-newsletters.dto';
import { UpdateNewsletterDto } from '../../newsletters/dto/update-newsletter.dto';
import { NewslettersService } from '../../newsletters/newsletters.service';

type AdminUser = {
  id: bigint;
  isAdmin?: boolean;
};

@ApiTags('Admin Newsletters')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/newsletters')
export class AdminNewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  private ensureAdmin(user: AdminUser) {
    if (!user.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List newsletter subscribers (admin)' })
  index(@CurrentUser() user: AdminUser, @Query() query: QueryNewslettersDto) {
    this.ensureAdmin(user);
    return this.newslettersService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get newsletter subscriber by id (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.newslettersService.show(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update newsletter subscriber (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Body() dto: UpdateNewsletterDto,
  ) {
    this.ensureAdmin(user);
    return this.newslettersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete newsletter subscriber (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    this.ensureAdmin(user);
    await this.newslettersService.destroy(id);
    return res.status(204).send();
  }
}
