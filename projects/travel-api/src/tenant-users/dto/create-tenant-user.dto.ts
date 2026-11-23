import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { TenantUserStatus } from '../entities/tenant-user.entity';

export class CreateTenantUserDto {
  @IsString() @IsNotEmpty() tenantId: string;
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() roleId: string;
  @IsOptional() @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'] as const) status?: TenantUserStatus;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}
