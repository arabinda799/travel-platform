import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { TrendingDestination, PopularHotel, HotelBooking, HotelAmendment } from './entities/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrendingDestination, PopularHotel, HotelBooking, HotelAmendment])],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
