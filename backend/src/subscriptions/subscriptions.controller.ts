import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@UseGuards(AuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user subscriptions' })
  index(@CurrentUser() user: any) {
    return this.subscriptionsService.index(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a subscription payment request' })
  create(@CurrentUser() user: any, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a subscription by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionsService.show(user.id, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiParam({ name: 'id', example: '1' })
  destroy(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionsService.destroy(user.id, id);
  }
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('campay')
  @ApiOperation({ summary: 'Handle Campay webhook confirmation' })
  @ApiQuery({ name: 'external_reference', required: true })
  campay(@Query('external_reference') externalReference: string) {
    return this.subscriptionsService.handleCampayWebhook(externalReference);
  }
}
