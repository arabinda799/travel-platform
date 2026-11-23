import {
  IsString, IsOptional, IsEmail, IsEnum, IsBoolean, IsArray,
} from 'class-validator';
import { PlatformUserStatus } from '../entities/platform-user.entity';

export class UpdatePlatformUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() roleId?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'] as const)
  status?: PlatformUserStatus;

  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}

export class UpdatePermissionsDto {
  @IsArray() @IsString({ each: true }) disabledPermissionIds: string[];
}
