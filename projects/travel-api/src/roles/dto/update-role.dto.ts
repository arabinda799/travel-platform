import { IsString, IsOptional, IsEnum, IsArray, IsIn } from 'class-validator';
import { RoleScope, RoleStatus, RoleType } from '../entities/role.entity';

export class UpdateRoleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['SYSTEM', 'CUSTOM'] as const) type?: RoleType;
  @IsOptional() @IsEnum(['PLATFORM', 'TENANT', 'B2B', 'B2C', 'SUPPLIER', 'VENDOR'] as const) scope?: RoleScope;
  @IsOptional() @IsIn(['PLATFORM', 'TENANT']) ownerType?: 'PLATFORM' | 'TENANT';
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'INACTIVE'] as const) status?: RoleStatus;
  @IsOptional() @IsArray() @IsString({ each: true }) permissionIds?: string[];
}
