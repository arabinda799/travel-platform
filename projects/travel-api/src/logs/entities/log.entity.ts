import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type EmailLogStatus = 'Sent' | 'Failed' | 'Bounced' | 'Queued';
export type SmsLogStatus = 'Sent' | 'Failed' | 'Pending';
export type LoginLogStatus = 'Success' | 'Failed' | 'Blocked';
export type CouponLogStatus = 'Applied' | 'Expired' | 'Invalid' | 'Limit Reached';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() to: string;
  @Column() subject: string;
  @Column({ default: '' }) template: string;
  @Column({ default: 'Queued' }) status: EmailLogStatus;
  @Column({ default: '' }) triggeredBy: string;
  @CreateDateColumn() sentAt: Date;
  @Column({ nullable: true, type: 'text' }) errorMessage: string | null;
}

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() to: string;
  @Column({ type: 'text' }) message: string;
  @Column({ default: '' }) template: string;
  @Column({ default: 'Pending' }) status: SmsLogStatus;
  @Column({ default: '' }) triggeredBy: string;
  @CreateDateColumn() sentAt: Date;
  @Column({ nullable: true, type: 'text' }) errorMessage: string | null;
}

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userName: string;
  @Column() email: string;
  @Column({ default: '' }) role: string;
  @Column({ default: '' }) ipAddress: string;
  @Column({ default: '' }) device: string;
  @Column({ default: '' }) browser: string;
  @Column({ default: 'Success' }) status: LoginLogStatus;
  @CreateDateColumn() createdAt: Date;
}

@Entity('coupon_logs')
export class CouponLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() couponCode: string;
  @Column() usedBy: string;
  @Column() email: string;
  @Column({ default: '' }) bookingId: string;
  @Column({ type: 'float', default: 0 }) discountAmount: number;
  @Column({ default: 'Flat' }) discountType: 'Flat' | 'Percentage';
  @Column({ default: 'Applied' }) status: CouponLogStatus;
  @CreateDateColumn() usedAt: Date;
}
