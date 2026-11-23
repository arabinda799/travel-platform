import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { PlatformUsersService } from './platform-users.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import {
  UpdatePlatformUserDto,
  BulkDeleteDto,
  UpdatePermissionsDto,
} from './dto/update-platform-user.dto';

@Controller('platform-users')
export class PlatformUsersController {
  constructor(private readonly service: PlatformUsersService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlatformUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlatformUserDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/permissions')
  updatePermissions(@Param('id') id: string, @Body() dto: UpdatePermissionsDto) {
    return this.service.updatePermissions(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.service.remove(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemove(@Body() dto: BulkDeleteDto) {
    this.service.bulkRemove(dto.ids);
  }
}
