import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PaymentGateway, ConvenienceFeeRule } from './entities/payment-gateway.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentGateway, ConvenienceFeeRule])],
  controllers: [PaymentGatewaysController],
  providers: [PaymentGatewaysService],
})
export class PaymentGatewaysModule {}
