import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsIn,
} from 'class-validator';
import { RoleScope, RoleType } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;

  @IsEnum(['SYSTEM', 'CUSTOM'] as const) type: RoleType;
  @IsEnum(['PLATFORM', 'TENANT', 'B2B', 'B2C', 'SUPPLIER', 'VENDOR'] as const) scope: RoleScope;
  @IsIn(['PLATFORM', 'TENANT']) ownerType: 'PLATFORM' | 'TENANT';

  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) permissionIds?: string[];
}
