import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { CustomerStatus } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() country: string;
  @IsOptional() @IsEnum(['Active', 'Inactive', 'Blocked'] as const) status?: CustomerStatus;
}
