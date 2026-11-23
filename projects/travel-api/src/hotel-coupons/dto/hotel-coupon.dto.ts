import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString() @IsNotEmpty() couponCode: string;
  @IsString() @IsNotEmpty() couponText: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsString() @IsNotEmpty() regionType: string;
  @IsString() @IsNotEmpty() starRating: string;
  @IsDateString() checkInDate: string;
  @IsDateString() checkOutDate: string;
  @IsIn(['Fixed', 'Percentage']) couponType: 'Fixed' | 'Percentage';
  @IsNumber() @Min(0) value: number;
  @IsNumber() @Min(1) couponUseLimit: number;
  @IsNumber() @Min(0) couponMaxLimit: number;
  @IsIn(['Yes', 'No']) showOnList: 'Yes' | 'No';
  @IsIn(['Active', 'Inactive']) status: 'Active' | 'Inactive';
  @IsDateString() validFromDate: string;
  @IsDateString() validToDate: string;
}

export class UpdateCouponDto {
  @IsOptional() @IsString() @IsNotEmpty() couponCode?: string;
  @IsOptional() @IsString() couponText?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() regionType?: string;
  @IsOptional() @IsString() starRating?: string;
  @IsOptional() @IsDateString() checkInDate?: string;
  @IsOptional() @IsDateString() checkOutDate?: string;
  @IsOptional() @IsIn(['Fixed', 'Percentage']) couponType?: 'Fixed' | 'Percentage';
  @IsOptional() @IsNumber() @Min(0) value?: number;
  @IsOptional() @IsNumber() @Min(1) couponUseLimit?: number;
  @IsOptional() @IsNumber() @Min(0) couponMaxLimit?: number;
  @IsOptional() @IsIn(['Yes', 'No']) showOnList?: 'Yes' | 'No';
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: 'Active' | 'Inactive';
  @IsOptional() @IsDateString() validFromDate?: string;
  @IsOptional() @IsDateString() validToDate?: string;
}

export class BulkDeleteDto {
  @IsString({ each: true }) ids: string[];
}
