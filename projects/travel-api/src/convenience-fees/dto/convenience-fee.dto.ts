import { IsString, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateConvenienceFeeDto {
  @IsString() name: string;
  @IsOptional() @IsIn(['HOTEL', 'FLIGHT', 'VISA', 'ALL']) serviceType?: string;
  @IsOptional() @IsIn(['PERCENTAGE', 'FIXED']) feeType?: string;
  @IsNumber() value: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class UpdateConvenienceFeeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsIn(['HOTEL', 'FLIGHT', 'VISA', 'ALL']) serviceType?: string;
  @IsOptional() @IsIn(['PERCENTAGE', 'FIXED']) feeType?: string;
  @IsOptional() @IsNumber() value?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class BulkDeleteDto {
  ids: string[];
}
