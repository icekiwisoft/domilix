import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { CreateCampaignDto } from '../../campaigns/dto/create-campaign.dto';
import { UpdateCampaignDto } from '../../campaigns/dto/update-campaign.dto';
import { QueryCampaignsDto } from '../../campaigns/dto/query-campaigns.dto';

type AdminUser = { id: number | bigint; isAdmin: boolean };

@ApiTags('Admin Campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('admin/campaigns')
export class AdminCampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  private ensureAdmin(user: AdminUser) {
    if (!user?.isAdmin) {
      throw new Error('Unauthorized');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns (admin)' })
  async index(
    @CurrentUser() user: AdminUser,
    @Query() query: QueryCampaignsDto,
  ) {
    this.ensureAdmin(user);
    return this.campaignsService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details (admin)' })
  async show(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.campaignsService.show(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a campaign (admin)' })
  async store(@CurrentUser() user: AdminUser, @Body() dto: CreateCampaignDto) {
    this.ensureAdmin(user);
    return this.campaignsService.store(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a campaign (admin)' })
  async update(
    @CurrentUser() user: AdminUser,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    this.ensureAdmin(user);
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign (admin)' })
  async destroy(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
    await this.campaignsService.destroy(id);
    return { message: 'Campagne supprimée' };
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a campaign to verified subscribers (admin)' })
  async send(@CurrentUser() user: AdminUser, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.campaignsService.send(id);
  }
}
