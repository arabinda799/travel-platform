import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantConfigController } from './tenant-config.controller';
import { TenantCompany } from '../tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantCompany])],
  controllers: [TenantConfigController],
})
export class TenantConfigModule {}
