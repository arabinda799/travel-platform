import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type FeeType = 'PERCENTAGE' | 'FIXED';
export type ServiceType = 'HOTEL' | 'FLIGHT' | 'VISA' | 'ALL';

@Entity('convenience_fees')
export class ConvenienceFee {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ default: 'ALL' }) serviceType: ServiceType;
  @Column({ default: 'FIXED' }) feeType: FeeType;
  @Column({ type: 'float', default: 0 }) value: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true, type: 'text' }) description: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
