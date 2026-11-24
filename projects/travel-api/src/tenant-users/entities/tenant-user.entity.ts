import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type TenantUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

@Entity('tenant_users')
export class TenantUser {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column() email: string;
  @Column({ default: '' }) phone: string;
  @Column() roleId: string;
  @Column({ default: 'ACTIVE' }) status: TenantUserStatus;
  @Column({ type: 'simple-json', default: '[]' }) disabledPermissionIds: string[];
  @Column({ default: false }) isPrimary: boolean;
  @Column({ nullable: true, select: false }) password?: string;
  @Column({ nullable: true, select: false }) resetToken?: string;
  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true, type: 'text' }) lastLoginAt: string | null;
}
