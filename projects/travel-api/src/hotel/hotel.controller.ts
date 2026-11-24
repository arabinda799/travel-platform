import { Controller, Get, Post, Patch, Delete, Body, Param, Query, DefaultValuePipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { HotelService } from './hotel.service';
import {
  CreateTrendingDestinationDto, UpdateTrendingDestinationDto,
  CreatePopularHotelDto, UpdatePopularHotelDto,
  BulkDeleteDto, BulkStatusDto, UpdateBookingDto, UpdateAmendmentDto,
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
  bulkRemoveDestinations(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveDestinations(dto.ids.map(String)); }

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
  bulkRemoveHotels(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveHotels(dto.ids.map(String)); }

  // ─── Bookings ────────────────────────────────────────────────────────────────

  @Get('hotel-bookings')
  findAllBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllBookingRecords(page, limit); }

  @Patch('hotel-bookings/bulk-status')
  bulkStatusBookings(@Body() dto: BulkStatusDto) { return this.service.bulkStatusBookingRecords(dto); }

  @Post('hotel-bookings/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDeleteBookings(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveBookingRecords(dto.ids); }

  @Get('hotel-bookings/:ref')
  findBooking(@Param('ref') ref: string) {
    if (/^\d{1,5}$/.test(ref)) {
      return this.service.findBookingRecordById(Number(ref));
    }
    return this.service.findBookingById(ref);
  }

  @Patch('hotel-bookings/:ref')
  updateBooking(@Param('ref') ref: string, @Body() dto: any) {
    if (/^\d{1,5}$/.test(ref)) {
      return this.service.updateBookingRecord(Number(ref), dto);
    }
    return this.service.updateBooking(ref, dto);
  }

  // ─── Amendments ──────────────────────────────────────────────────────────────

  @Get('hotel-amendments')
  findAllAmendments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllAmendmentRecords(page, limit); }

  @Patch('hotel-amendments/bulk-status')
  bulkStatusAmendments(@Body() dto: BulkStatusDto) { return this.service.bulkStatusAmendmentRecords(dto); }

  @Post('hotel-amendments/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDeleteAmendments(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveAmendmentRecords(dto.ids); }

  @Get('hotel-amendments/:id')
  findAmendment(@Param('id') id: string) {
    if (/^\d{1,5}$/.test(id)) {
      return this.service.findAmendmentRecordById(Number(id));
    }
    return this.service.findAmendmentById(id);
  }

  @Patch('hotel-amendments/:id')
  updateAmendment(@Param('id') id: string, @Body() dto: any) {
    if (/^\d{1,5}$/.test(id)) {
      return this.service.updateAmendmentRecord(Number(id), dto);
    }
    return this.service.updateAmendment(id, dto);
  }

  @Patch('hotel-amendments/:id/approve')
  approveAmendment(@Param('id') id: string) { return this.service.approveAmendment(id); }

  @Patch('hotel-amendments/:id/reject')
  rejectAmendment(@Param('id') id: string) { return this.service.rejectAmendment(id); }

  // ─── Refunds ─────────────────────────────────────────────────────────────────

  @Get('hotel-refunds')
  findAllRefunds(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllRefundRecords(page, limit); }

  @Patch('hotel-refunds/bulk-status')
  bulkStatusRefunds(@Body() dto: BulkStatusDto) { return this.service.bulkStatusRefundRecords(dto); }

  @Post('hotel-refunds/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDeleteRefunds(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveRefundRecords(dto.ids); }

  @Get('hotel-refunds/:id')
  findRefund(@Param('id') id: string) { return this.service.findRefundRecordById(id); }

  @Patch('hotel-refunds/:id')
  updateRefund(@Param('id') id: string, @Body() dto: any) { return this.service.updateRefundRecord(id, dto); }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  @Get('hotel-queries')
  findAllQueries(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllHotelQueryRecords(page, limit); }

  @Post('hotel-queries')
  createQuery(@Body() dto: any) { return this.service.createHotelQueryRecord(dto); }

  @Patch('hotel-queries/bulk-status')
  bulkStatusQueries(@Body() dto: BulkStatusDto) { return this.service.bulkStatusHotelQueryRecords(dto); }

  @Post('hotel-queries/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDeleteQueries(@Body() dto: BulkDeleteDto) { return this.service.bulkRemoveHotelQueryRecords(dto.ids); }

  @Get('hotel-queries/:id')
  findQuery(@Param('id') id: string) { return this.service.findHotelQueryRecordById(id); }

  @Patch('hotel-queries/:id')
  updateQuery(@Param('id') id: string, @Body() dto: any) { return this.service.updateHotelQueryRecord(id, dto); }

  @Delete('hotel-queries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuery(@Param('id') id: string) { return this.service.removeHotelQueryRecord(id); }

  // ─── Public App APIs ─────────────────────────────────────────────────────────

  @Public()
  @Get('app/trending-destinations')
  getAppDestinations(@Query('tenantId') tenantId?: string) {
    return this.service.findAllDestinations(1, 100);
  }

  @Public()
  @Get('app/popular-hotels')
  getAppPopularHotels(@Query('tenantId') tenantId?: string) {
    return this.service.findAllHotels(1, 100);
  }
}
