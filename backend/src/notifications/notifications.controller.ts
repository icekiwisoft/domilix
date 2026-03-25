import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user notifications' })
  @ApiQuery({ name: 'unread_only', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'page', required: false })
  index(
    @CurrentUser() user: any,
    @Query('unread_only') unreadOnly?: string,
    @Query('per_page') perPage?: string,
    @Query('page') page?: string,
  ) {
    return this.notificationsService.index(
      user.id,
      unreadOnly === 'true' || unreadOnly === '1',
      Number(perPage || 20),
      Number(page || 1),
    );
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Count unread notifications' })
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiParam({ name: 'id', example: '1' })
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', example: '1' })
  destroy(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.destroy(user.id, id);
  }

  @Delete('read/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all read notifications' })
  deleteAllRead(@CurrentUser() user: any) {
    return this.notificationsService.deleteAllRead(user.id);
  }
}
