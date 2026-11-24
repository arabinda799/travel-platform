import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PlatformUsersModule } from './platform-users/platform-users.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantUsersModule } from './tenant-users/tenant-users.module';
import { CustomersModule } from './customers/customers.module';
import { VendorsModule } from './vendors/vendors.module';
import { PaymentGatewaysModule } from './payment-gateways/payment-gateways.module';
import { HotelPricingModule } from './hotel-pricing/hotel-pricing.module';
import { HotelCouponsModule } from './hotel-coupons/hotel-coupons.module';
import { ContentModule } from './content/content.module';
import { LogsModule } from './logs/logs.module';
import { HotelModule } from './hotel/hotel.module';
import { TenantConfigModule } from './tenant-config/tenant-config.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'travel-platform.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    SettingsModule,
    RolesModule,
    PlatformUsersModule,
    TenantsModule,
    TenantUsersModule,
    CustomersModule,
    VendorsModule,
    PaymentGatewaysModule,
    HotelPricingModule,
    HotelCouponsModule,
    ContentModule,
    LogsModule,
    HotelModule,
    TenantConfigModule,
    FinanceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
