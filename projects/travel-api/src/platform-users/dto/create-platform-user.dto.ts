import {
  IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsBoolean,
} from 'class-validator';
import { PlatformUserStatus } from '../entities/platform-user.entity';

export class CreatePlatformUserDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() roleId: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'] as const)
  status?: PlatformUserStatus;

  @IsOptional() @IsBoolean() isPrimary?: boolean;
}
