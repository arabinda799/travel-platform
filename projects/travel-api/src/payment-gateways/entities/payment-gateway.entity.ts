import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PaymentMode = 'Credit Card' | 'RuPay Credit Card' | 'Visa Credit Card' | 'Mastercard Credit Card' | 'American Express Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI' | 'Cash Card';
export type ServiceType = 'Hotel' | 'Make Payment' | 'Flight' | 'Package';
export type GatewayStatus = 'Active' | 'Inactive';
export type FeeType = 'Fixed' | 'Percentage';

export interface PaymentModeFeeConfig { mode: PaymentMode; value: number; type: FeeType; }

@Entity('payment_gateways')
export class PaymentGateway {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ default: '' }) image: string;
  @Column({ type: 'simple-json', default: '[]' }) paymentModes: PaymentMode[];
  @Column({ default: '' }) remark: string;
  @Column({ type: 'simple-json', default: '{}' }) credentials: Record<string, string>;
  @Column({ default: 'Active' }) status: GatewayStatus;
  @CreateDateColumn() createdDate: Date;
  @UpdateDateColumn() updatedDate: Date;
}

@Entity('convenience_fee_rules')
export class ConvenienceFeeRule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() gatewayId: string;
  @Column() gatewayName: string;
  @Column() service: ServiceType;
  @Column({ type: 'float', default: 0 }) minAmount: number;
  @Column({ type: 'float', default: 0 }) maxAmount: number;
  @Column({ type: 'simple-json', default: '[]' }) feesByMode: PaymentModeFeeConfig[];
  @Column({ default: 'Active' }) status: GatewayStatus;
  @CreateDateColumn() createdDate: Date;
  @UpdateDateColumn() updatedDate: Date;
}
