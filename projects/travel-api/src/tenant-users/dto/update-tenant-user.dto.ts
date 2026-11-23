import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { TenantUserStatus } from '../entities/tenant-user.entity';

export class UpdateTenantUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() roleId?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'] as const) status?: TenantUserStatus;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}

export class UpdatePermissionsDto {
  @IsArray() @IsString({ each: true }) disabledPermissionIds: string[];
}
