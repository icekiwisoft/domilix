import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreatePublicationDto } from '../../publications/dto/create-publication.dto';
import { QueryPublicationsDto } from '../../publications/dto/query-publications.dto';
import { PublicationsService } from '../../publications/publications.service';

@ApiTags('Admin Publications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/publications')
export class AdminPublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List Facebook publications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  index(@CurrentUser() user: any, @Query() query: QueryPublicationsDto) {
    return this.publicationsService.index(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Facebook publication details' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    return this.publicationsService.show(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a Facebook publication draft' })
  create(@CurrentUser() user: any, @Body() dto: CreatePublicationDto) {
    return this.publicationsService.createDraft(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Facebook publication draft' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreatePublicationDto,
  ) {
    return this.publicationsService.update(user, id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Queue a Facebook publication' })
  @ApiParam({ name: 'id', example: '1' })
  publish(@CurrentUser() user: any, @Param('id') id: string) {
    return this.publicationsService.publish(user, id);
  }
}
