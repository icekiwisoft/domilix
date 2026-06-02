import {
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
import { Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  index(@CurrentUser() user: any, @Query('page') page?: string) {
    return this.usersService.index(user, Number(page || 1));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.show(user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', example: '1' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user' })
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
  @ApiOperation({ summary: 'Create a request for user to become announcer' })
  @ApiParam({ name: 'id', example: '1' })
  becomeAnnouncer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.becomeAnnouncer(user, id);
  }

  @Post(':id/promote')
  @ApiOperation({ summary: 'Create a request for user to become announcer' })
  @ApiParam({ name: 'id', example: '1' })
  promote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.becomeAnnouncer(user, id);
  }
}
