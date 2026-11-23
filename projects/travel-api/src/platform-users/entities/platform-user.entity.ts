import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type PlatformUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

@Entity('platform_users')
export class PlatformUser {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ unique: true }) email: string;
  @Column({ default: '' }) phone: string;
  @Column() roleId: string;
  @Column({ default: 'ACTIVE' }) status: PlatformUserStatus;
  @Column({ type: 'simple-json', default: '[]' }) disabledPermissionIds: string[];
  @Column({ default: false }) isPrimary: boolean;
  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true, type: 'text' }) lastLoginAt: string | null;
  @Column({ nullable: true, type: 'text', select: false }) password: string | null;
}
