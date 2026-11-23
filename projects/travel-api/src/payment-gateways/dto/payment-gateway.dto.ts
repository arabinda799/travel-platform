import {
  IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsObject, IsIn, IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeType, GatewayStatus, PaymentMode, ServiceType } from '../entities/payment-gateway.entity';

const PAYMENT_MODES = [
  'Credit Card', 'RuPay Credit Card', 'Visa Credit Card', 'Mastercard Credit Card',
  'American Express Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Cash Card',
] as const;
const GATEWAY_STATUSES = ['Active', 'Inactive'] as const;
const SERVICE_TYPES = ['Hotel', 'Make Payment', 'Flight', 'Package'] as const;
const FEE_TYPES = ['Fixed', 'Percentage'] as const;

export class CreateGatewayDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() image: string;
  @IsArray() @IsEnum(PAYMENT_MODES, { each: true }) paymentModes: PaymentMode[];
  @IsString() remark: string;
  @IsObject() credentials: Record<string, string>;
  @IsIn(GATEWAY_STATUSES) status: GatewayStatus;
}

export class UpdateGatewayDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsArray() @IsEnum(PAYMENT_MODES, { each: true }) paymentModes?: PaymentMode[];
  @IsOptional() @IsString() remark?: string;
  @IsOptional() @IsObject() credentials?: Record<string, string>;
  @IsOptional() @IsIn(GATEWAY_STATUSES) status?: GatewayStatus;
}

export class BulkStatusDto {
  @IsArray() @IsString({ each: true }) ids: string[];
  @IsIn(GATEWAY_STATUSES) status: GatewayStatus;
}

export class PaymentModeFeeConfigDto {
  @IsIn(PAYMENT_MODES) mode: PaymentMode;
  @IsNumber() value: number;
  @IsIn(FEE_TYPES) type: FeeType;
}

export class SaveFeeRuleDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() gatewayId: string;
  @IsIn(SERVICE_TYPES) service: ServiceType;
  @IsNumber() minAmount: number;
  @IsNumber() maxAmount: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentModeFeeConfigDto) feesByMode: PaymentModeFeeConfigDto[];
  @IsIn(GATEWAY_STATUSES) status: GatewayStatus;
}
