import { Controller, Get, Post, Patch, Delete, Body, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { HotelService } from './hotel.service';
import {
  CreateTrendingDestinationDto, UpdateTrendingDestinationDto,
  CreatePopularHotelDto, UpdatePopularHotelDto,
  BulkDeleteDto, UpdateBookingDto, UpdateAmendmentDto,
} from './dto/hotel.dto';

@Controller()
export class HotelController {
  constructor(private readonly service: HotelService) {}

  // ─── Trending Destinations ───────────────────────────────────────────────────

  @Get('trending-destinations')
  findAllDestinations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllDestinations(page, limit); }

  @Post('trending-destinations')
  createDestination(@Body() dto: CreateTrendingDestinationDto) { return this.service.createDestination(dto); }

  @Patch('trending-destinations/:id')
  updateDestination(@Param('id') id: string, @Body() dto: UpdateTrendingDestinationDto) { return this.service.updateDestination(id, dto); }

  @Delete('trending-destinations/:id')
  removeDestination(@Param('id') id: string) { return this.service.removeDestination(id); }

  @Post('trending-destinations/bulk-delete')
  bulkRemoveDestinations(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveDestinations(dto.ids); }

  // ─── Popular Hotels ──────────────────────────────────────────────────────────

  @Get('popular-hotels')
  findAllHotels(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllHotels(page, limit); }

  @Post('popular-hotels')
  createHotel(@Body() dto: CreatePopularHotelDto) { return this.service.createHotel(dto); }

  @Patch('popular-hotels/:id')
  updateHotel(@Param('id') id: string, @Body() dto: UpdatePopularHotelDto) { return this.service.updateHotel(id, dto); }

  @Delete('popular-hotels/:id')
  removeHotel(@Param('id') id: string) { return this.service.removeHotel(id); }

  @Post('popular-hotels/bulk-delete')
  bulkRemoveHotels(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveHotels(dto.ids); }

  // ─── Bookings ────────────────────────────────────────────────────────────────

  @Get('hotel-bookings/:ref')
  findBooking(@Param('ref') ref: string) { return this.service.findBookingById(ref); }

  @Patch('hotel-bookings/:ref')
  updateBooking(@Param('ref') ref: string, @Body() dto: UpdateBookingDto) { return this.service.updateBooking(ref, dto); }

  // ─── Amendments ──────────────────────────────────────────────────────────────

  @Get('hotel-amendments/:id')
  findAmendment(@Param('id') id: string) { return this.service.findAmendmentById(id); }

  @Patch('hotel-amendments/:id')
  updateAmendment(@Param('id') id: string, @Body() dto: UpdateAmendmentDto) { return this.service.updateAmendment(id, dto); }

  @Patch('hotel-amendments/:id/approve')
  approveAmendment(@Param('id') id: string) { return this.service.approveAmendment(id); }

  @Patch('hotel-amendments/:id/reject')
  rejectAmendment(@Param('id') id: string) { return this.service.rejectAmendment(id); }
}
