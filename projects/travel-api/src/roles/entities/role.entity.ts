import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type RoleType = 'SYSTEM' | 'CUSTOM';
export type RoleScope = 'PLATFORM' | 'TENANT' | 'B2B' | 'B2C' | 'SUPPLIER' | 'VENDOR';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) key: string;
  @Column() name: string;
  @Column({ nullable: true, type: 'text' }) description: string | null;
  @Column() type: RoleType;
  @Column() scope: RoleScope;
  @Column() ownerType: 'PLATFORM' | 'TENANT';
  @Column({ nullable: true, type: 'text' }) ownerId: string | null;
  @Column({ default: 'ACTIVE' }) status: RoleStatus;
  @Column({ type: 'simple-json', default: '[]' }) permissionIds: string[];
  @CreateDateColumn() createdAt: Date;
}
