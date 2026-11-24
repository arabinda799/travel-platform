import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wallet_accounts')
export class WalletAccount {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: 'easyfly' }) tenantId: string;
  @Column({ default: 'INR' }) currency: string;
  @Column({ type: 'float', default: 284500 }) balance: number;
  @Column({ type: 'float', default: 500000 }) creditLimit: number;
  @Column({ type: 'float', default: 18500 }) holdAmount: number;
  @Column({ default: 'ACTIVE' }) status: string;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: 'easyfly' }) tenantId: string;
  @Column({ default: '' }) txRef: string;
  @Column({ default: '' }) orderId: string;
  @Column({ default: 'Credit' }) type: 'Credit' | 'Debit';
  @Column({ default: 'Booking Deduction' }) category: string;
  @Column({ default: '' }) description: string;
  @Column({ type: 'float', default: 0 }) amount: number;
  @Column({ type: 'float', default: 0 }) balanceAfter: number;
  @Column({ default: 'Wallet' }) paymentGateway: string;
  @Column({ default: 'Completed' }) status: string;
  @Column({ default: '' }) date: string;
  @CreateDateColumn() createdAt: Date;
}
