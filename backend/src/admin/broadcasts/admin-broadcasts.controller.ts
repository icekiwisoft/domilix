import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
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
import { BroadcastsService } from '../../broadcasts/broadcasts.service';
import { CreateBroadcastDto } from '../../broadcasts/dto/create-broadcast.dto';
import { QueryBroadcastsDto } from '../../broadcasts/dto/query-broadcasts.dto';

@ApiTags('Admin Broadcasts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/broadcasts')
export class AdminBroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required');
  }

  @Get()
  @ApiOperation({ summary: 'List broadcasts (admin)' })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  index(@CurrentUser() user: any, @Query() query: QueryBroadcastsDto) {
    this.ensureAdmin(user);
    return this.broadcastsService.index(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get broadcast details (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    this.ensureAdmin(user);
    return this.broadcastsService.show(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a broadcast (admin)' })
  create(@CurrentUser() user: any, @Body() dto: CreateBroadcastDto) {
    this.ensureAdmin(user);
    return this.broadcastsService.create(user, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a broadcast (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateBroadcastDto,
  ) {
    this.ensureAdmin(user);
    return this.broadcastsService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a broadcast (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    this.ensureAdmin(user);
    await this.broadcastsService.destroy(user, id);
    return res.status(204).send();
  }
}
