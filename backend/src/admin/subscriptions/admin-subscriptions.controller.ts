import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AdminSubscriptionsService } from './admin-subscriptions.service';

@ApiTags('Admin Subscriptions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/subscriptions')
export class AdminSubscriptionsController {
  constructor(
    private readonly adminSubscriptionsService: AdminSubscriptionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all subscriptions with user information (admin)',
  })
  @ApiQuery({ name: 'page', required: false })
  index(@CurrentUser() user: any, @Query('page') page?: string) {
    return this.adminSubscriptionsService.index(user, Number(page || 1));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription with user information (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminSubscriptionsService.show(user, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  destroy(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminSubscriptionsService.destroy(user, id);
  }
}
