import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { HotelPricingService } from './hotel-pricing.service';
import { CreateMarkupDto, UpdateMarkupDto, CreateDiscountDto, UpdateDiscountDto, BulkStatusDto, BulkDeleteDto } from './dto/hotel-pricing.dto';

@Controller()
export class HotelPricingController {
  constructor(private readonly service: HotelPricingService) {}

  // ─── Markups ──────────────────────────────────────────────────────────────

  @Get('hotel-markups')
  getAllMarkups(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllMarkups(page, limit); }

  @Get('hotel-markups/:id')
  getMarkup(@Param('id') id: string) { return this.service.findOneMarkup(id); }

  @Post('hotel-markups')
  createMarkup(@Body() dto: CreateMarkupDto) { return this.service.createMarkup(dto); }

  @Patch('hotel-markups/bulk-status')
  bulkMarkupStatus(@Body() dto: BulkStatusDto) { return this.service.bulkUpdateMarkupStatus(dto); }

  @Patch('hotel-markups/:id')
  updateMarkup(@Param('id') id: string, @Body() dto: UpdateMarkupDto) { return this.service.updateMarkup(id, dto); }

  @Delete('hotel-markups/:id')
  @HttpCode(204)
  removeMarkup(@Param('id') id: string) { this.service.removeMarkup(id); }

  @Post('hotel-markups/bulk-delete')
  @HttpCode(204)
  bulkDeleteMarkups(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveMarkups(dto); }

  // ─── Discounts ────────────────────────────────────────────────────────────

  @Get('hotel-discounts')
  getAllDiscounts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllDiscounts(page, limit); }

  @Get('hotel-discounts/:id')
  getDiscount(@Param('id') id: string) { return this.service.findOneDiscount(id); }

  @Post('hotel-discounts')
  createDiscount(@Body() dto: CreateDiscountDto) { return this.service.createDiscount(dto); }

  @Patch('hotel-discounts/bulk-status')
  bulkDiscountStatus(@Body() dto: BulkStatusDto) { return this.service.bulkUpdateDiscountStatus(dto); }

  @Patch('hotel-discounts/:id')
  updateDiscount(@Param('id') id: string, @Body() dto: UpdateDiscountDto) { return this.service.updateDiscount(id, dto); }

  @Delete('hotel-discounts/:id')
  @HttpCode(204)
  removeDiscount(@Param('id') id: string) { this.service.removeDiscount(id); }

  @Post('hotel-discounts/bulk-delete')
  @HttpCode(204)
  bulkDeleteDiscounts(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveDiscounts(dto); }
}
