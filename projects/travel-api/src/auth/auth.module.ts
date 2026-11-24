import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PlatformUsersModule } from '../platform-users/platform-users.module';
import { TenantUsersModule } from '../tenant-users/tenant-users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'easyflys-jwt-secret-change-in-prod',
      signOptions: { expiresIn: '8h' },
    }),
    PlatformUsersModule,
    TenantUsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
