import {
  IsString, IsNotEmpty, IsArray, IsEnum, IsBoolean, IsOptional, IsObject, IsIn,
} from 'class-validator';
import { VendorAuthType, VendorMode, VendorServiceType } from '../entities/vendor.entity';

export class CreateVendorDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsArray() @IsEnum(['HOTEL', 'FLIGHT', 'HOLIDAY', 'BUS'] as const, { each: true }) services: VendorServiceType[];
  @IsIn(['LIVE', 'TEST']) mode: VendorMode;
  @IsString() @IsNotEmpty() apiUrl: string;
  @IsIn(['API_KEY', 'BASIC_AUTH', 'BEARER_TOKEN']) authType: VendorAuthType;
  @IsObject() credentials: Record<string, string>;
  @IsBoolean() isActive: boolean;
}

export class UpdateVendorDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsArray() @IsEnum(['HOTEL', 'FLIGHT', 'HOLIDAY', 'BUS'] as const, { each: true }) services?: VendorServiceType[];
  @IsOptional() @IsIn(['LIVE', 'TEST']) mode?: VendorMode;
  @IsOptional() @IsString() apiUrl?: string;
  @IsOptional() @IsIn(['API_KEY', 'BASIC_AUTH', 'BEARER_TOKEN']) authType?: VendorAuthType;
  @IsOptional() @IsObject() credentials?: Record<string, string>;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() healthStatus?: string;
  @IsOptional() latencyMs?: number;
  @IsOptional() @IsString() lastSync?: string;
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}
