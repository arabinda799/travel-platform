import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { EmailLog, SmsLog, LoginLog, CouponLog } from './entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, SmsLog, LoginLog, CouponLog])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
