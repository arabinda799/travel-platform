import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import {
  TrendingDestination,
  PopularHotel,
  HotelBooking,
  HotelAmendment,
  HotelBookingRecord,
  HotelAmendmentRecord,
  HotelRefundRecord,
  HotelQueryRecord,
} from './entities/hotel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrendingDestination,
      PopularHotel,
      HotelBooking,
      HotelAmendment,
      HotelBookingRecord,
      HotelAmendmentRecord,
      HotelRefundRecord,
      HotelQueryRecord,
    ]),
  ],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
