import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelPricingController } from './hotel-pricing.controller';
import { HotelPricingService } from './hotel-pricing.service';
import { HotelMarkup, HotelDiscount } from './entities/hotel-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelMarkup, HotelDiscount])],
  controllers: [HotelPricingController],
  providers: [HotelPricingService],
})
export class HotelPricingModule {}
