import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type CouponType = 'Fixed' | 'Percentage';
export type CouponStatus = 'Active' | 'Inactive';
export type ShowOnList = 'Yes' | 'No';

@Entity('hotel_coupons')
export class HotelCoupon {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) couponCode: string;
  @Column({ default: '' }) couponText: string;
  @Column({ default: '' }) imageUrl: string;
  @Column({ default: '' }) regionType: string;
  @Column({ default: '' }) starRating: string;
  @Column({ nullable: true, type: 'text' }) checkInDate: string;
  @Column({ nullable: true, type: 'text' }) checkOutDate: string;
  @Column() couponType: CouponType;
  @Column({ type: 'float', default: 0 }) value: number;
  @Column({ default: 0 }) couponUseLimit: number;
  @Column({ default: 0 }) usedCount: number;
  @Column({ default: 0 }) couponMaxLimit: number;
  @Column({ default: 'No' }) showOnList: ShowOnList;
  @Column({ default: 'Active' }) status: CouponStatus;
  @Column({ nullable: true, type: 'text' }) validFromDate: string;
  @Column({ nullable: true, type: 'text' }) validToDate: string;
  @CreateDateColumn() createdAt: Date;
}
