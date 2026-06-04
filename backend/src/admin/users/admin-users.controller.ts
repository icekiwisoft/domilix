import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { UsersService } from '../../users/users.service';

@ApiTags('Admin Users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user (admin)' })
  create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users (admin)' })
  index(@CurrentUser() user: any, @Query('page') page?: string) {
    return this.usersService.index(user, Number(page || 1));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.show(user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user (admin)' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    await this.usersService.destroy(user, id);
    return res.status(204).send();
  }

  @Patch(':id/become-announcer')
  @ApiOperation({
    summary: 'Create a request for user to become announcer (admin)',
  })
  @ApiParam({ name: 'id', example: '1' })
  becomeAnnouncer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.becomeAnnouncer(user, id);
  }

  @Post(':id/promote')
  @ApiOperation({
    summary: 'Create a request for user to become announcer (admin)',
  })
  @ApiParam({ name: 'id', example: '1' })
  promote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.becomeAnnouncer(user, id);
  }
}
