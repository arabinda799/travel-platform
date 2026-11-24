import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ConvenienceFeesService } from './convenience-fees.service';
import { CreateConvenienceFeeDto, UpdateConvenienceFeeDto, BulkDeleteDto } from './dto/convenience-fee.dto';

@Controller('convenience-fees')
export class ConvenienceFeesController {
  constructor(private readonly service: ConvenienceFeesService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAll(page, limit); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateConvenienceFeeDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConvenienceFeeDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) { await this.service.remove(id); }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkRemove(@Body() dto: BulkDeleteDto) { await this.service.bulkRemove(dto.ids); }
}
