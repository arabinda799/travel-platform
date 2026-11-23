import { IsArray, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PricingTarget, HotelMarkupType, DisplayMarkup } from '../entities/hotel-pricing.entity';

const PRICING_TARGETS: PricingTarget[] = ['B2B', 'B2C', 'Corporate', 'All'];
const MARKUP_TYPES: HotelMarkupType[] = ['Per Night', 'Per Stay', 'Percentage', 'Fixed'];
const DISPLAY_MARKUPS: DisplayMarkup[] = ['In Tax', 'In Room Rate', 'Separate Line Item'];

export class CreateMarkupDto {
  @IsIn(PRICING_TARGETS) markupFor: PricingTarget;
  @IsArray() @IsString({ each: true }) regionTypes: string[];
  @IsIn(MARKUP_TYPES) hotelMarkupType: HotelMarkupType;
  @IsIn(DISPLAY_MARKUPS) displayMarkup: DisplayMarkup;
  @IsNumber() @Min(0) value: number;
  @IsIn(['Active', 'Inactive']) status: 'Active' | 'Inactive';
}

export class UpdateMarkupDto {
  @IsOptional() @IsIn(PRICING_TARGETS) markupFor?: PricingTarget;
  @IsOptional() @IsArray() @IsString({ each: true }) regionTypes?: string[];
  @IsOptional() @IsIn(MARKUP_TYPES) hotelMarkupType?: HotelMarkupType;
  @IsOptional() @IsIn(DISPLAY_MARKUPS) displayMarkup?: DisplayMarkup;
  @IsOptional() @IsNumber() @Min(0) value?: number;
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: 'Active' | 'Inactive';
}

export class CreateDiscountDto {
  @IsIn(PRICING_TARGETS) markupFor: PricingTarget;
  @IsArray() @IsString({ each: true }) regionTypes: string[];
  @IsNumber() @Min(0) value: number;
  @IsOptional() @IsNumber() @Min(0) maxLimit?: number | null;
  @IsIn(['Active', 'Inactive']) status: 'Active' | 'Inactive';
}

export class UpdateDiscountDto {
  @IsOptional() @IsIn(PRICING_TARGETS) markupFor?: PricingTarget;
  @IsOptional() @IsArray() @IsString({ each: true }) regionTypes?: string[];
  @IsOptional() @IsNumber() @Min(0) value?: number;
  @IsOptional() @IsNumber() @Min(0) maxLimit?: number | null;
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: 'Active' | 'Inactive';
}

export class BulkStatusDto {
  @IsArray() @IsString({ each: true }) ids: string[];
  @IsIn(['Active', 'Inactive']) status: 'Active' | 'Inactive';
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}
