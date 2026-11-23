import { IsString, IsOptional, IsEnum, IsIn } from 'class-validator';
import { FirmType, PgOwner, TenantStatus } from '../entities/tenant.entity';

export class UpdateTenantDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() companyCode?: string;
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsEnum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'LLP'] as const) firmType?: FirmType;
  @IsOptional() @IsIn(['PLATFORM', 'TENANT']) pgOwner?: PgOwner;
  @IsOptional() @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED'] as const) status?: TenantStatus;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() trialEndsAt?: string;
  @IsOptional() branding?: Record<string, unknown>;
  @IsOptional() smtp?: Record<string, unknown>;
}
