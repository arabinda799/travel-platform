import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { HotelCouponsService } from './hotel-coupons.service';
import { CreateCouponDto, UpdateCouponDto, BulkDeleteDto } from './dto/hotel-coupon.dto';

@Controller('hotel-coupons')
export class HotelCouponsController {
  constructor(private readonly service: HotelCouponsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAll(page, limit); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateCouponDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) { this.service.remove(id); }

  @Post('bulk-delete')
  @HttpCode(204)
  bulkDelete(@Body() dto: BulkDeleteDto) { this.service.bulkRemove(dto); }
}
