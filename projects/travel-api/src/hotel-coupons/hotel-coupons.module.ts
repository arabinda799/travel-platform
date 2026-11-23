import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelCouponsController } from './hotel-coupons.controller';
import { HotelCouponsService } from './hotel-coupons.service';
import { HotelCoupon } from './entities/hotel-coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelCoupon])],
  controllers: [HotelCouponsController],
  providers: [HotelCouponsService],
})
export class HotelCouponsModule {}
