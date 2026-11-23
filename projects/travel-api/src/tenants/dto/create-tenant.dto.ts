import { IsString, IsNotEmpty, IsEnum, IsOptional, IsIn } from 'class-validator';
import { FirmType, PgOwner } from '../entities/tenant.entity';

export class CreateTenantDto {
  @IsString() @IsNotEmpty() companyName: string;
  @IsString() @IsNotEmpty() companyCode: string;
  @IsString() @IsNotEmpty() domain: string;
  @IsEnum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'LLP'] as const) firmType: FirmType;
  @IsIn(['PLATFORM', 'TENANT']) pgOwner: PgOwner;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() trialEndsAt?: string;
  @IsOptional() branding?: Record<string, unknown>;
  @IsOptional() smtp?: Record<string, unknown>;
}
