import { IsString, IsOptional, IsEmail, IsEnum, IsArray } from 'class-validator';
import { CustomerStatus } from '../entities/customer.entity';

export class UpdateCustomerDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsEnum(['Active', 'Inactive', 'Blocked'] as const) status?: CustomerStatus;
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}
