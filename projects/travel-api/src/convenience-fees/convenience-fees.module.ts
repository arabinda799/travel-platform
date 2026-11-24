import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvenienceFee } from './entities/convenience-fee.entity';
import { ConvenienceFeesService } from './convenience-fees.service';
import { ConvenienceFeesController } from './convenience-fees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConvenienceFee])],
  controllers: [ConvenienceFeesController],
  providers: [ConvenienceFeesService],
})
export class ConvenienceFeesModule {}
