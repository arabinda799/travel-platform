import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto, BulkDeleteDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAll(page, limit); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateCustomerDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { this.service.remove(id); }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemove(@Body() dto: BulkDeleteDto) { this.service.bulkRemove(dto.ids); }
}
