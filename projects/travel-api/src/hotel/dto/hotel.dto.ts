import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsIn, Min } from 'class-validator';

export class CreateTrendingDestinationDto {
  @IsString() name: string;
  @IsOptional() @IsString() subtitle?: string | null;
  @IsOptional() @IsString() imageUrl?: string | null;
  @IsNumber() sortOrder: number;
  @IsBoolean() isActive: boolean;
}

export class UpdateTrendingDestinationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() subtitle?: string | null;
  @IsOptional() @IsString() imageUrl?: string | null;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreatePopularHotelDto {
  @IsOptional() @IsString() title?: string | null;
  @IsOptional() @IsString() imageUrl?: string | null;
  @IsNumber() sortOrder: number;
  @IsBoolean() isActive: boolean;
}

export class UpdatePopularHotelDto {
  @IsOptional() @IsString() title?: string | null;
  @IsOptional() @IsString() imageUrl?: string | null;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}

export class UpdateBookingDto {
  @IsOptional() @IsString() issueSupplier?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() paymentStatus?: string;
  @IsOptional() @IsString() hotelConfirmationNo?: string;
  @IsOptional() @IsBoolean() refundBookingAmount?: boolean;
  @IsOptional() @IsBoolean() deductBookingAmount?: boolean;
  @IsOptional() @IsString() note?: string;
}

export class UpdateAmendmentDto {
  @IsOptional() @IsNumber() @Min(0) cancellationCharge?: number;
  @IsOptional() @IsNumber() @Min(0) cancellationServiceCharge?: number;
  @IsOptional() @IsNumber() @Min(0) cancellationChargeGst?: number;
  @IsOptional() @IsNumber() @Min(0) refundAmount?: number;
  @IsOptional() @IsBoolean() tdsReturn?: boolean;
  @IsOptional() @IsBoolean() changeBookingCurrencyRate?: boolean;
  @IsOptional() @IsNumber() @Min(0) currentCurrencyRate?: number;
  @IsOptional() @IsString() amendmentStatus?: string;
}
