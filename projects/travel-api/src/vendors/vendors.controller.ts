import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, BulkDeleteDto } from './dto/vendor.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly service: VendorsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAll(page, limit); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateVendorDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/ping')
  ping(@Param('id') id: string) { return this.service.ping(id); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { this.service.remove(id); }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemove(@Body() dto: BulkDeleteDto) { this.service.bulkRemove(dto.ids); }
}
