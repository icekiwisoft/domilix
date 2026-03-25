import { Controller, Delete, Get, Param, Patch, Put, Query, Res } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  index(@Query('page') page?: string) {
    return this.usersService.index(Number(page || 1));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', example: '1' })
  show(@Param('id') id: string) {
    return this.usersService.show(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', example: '1' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiParam({ name: 'id', example: '1' })
  async destroy(@Param('id') id: string, @Res() res: any) {
    await this.usersService.destroy(id);
    return res.status(204).send();
  }

  @Patch(':id/become-announcer')
  @ApiOperation({ summary: 'Create a request for user to become announcer' })
  @ApiParam({ name: 'id', example: '1' })
  becomeAnnouncer(@Param('id') id: string) {
    return this.usersService.becomeAnnouncer(id);
  }
}
