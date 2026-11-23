import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ unique: true }) email: string;
  @Column({ default: '' }) phone: string;
  @Column({ default: '' }) country: string;
  @Column({ default: 'Active' }) status: CustomerStatus;
  @CreateDateColumn() registeredAt: Date;
  @Column({ nullable: true, type: 'text' }) lastLogin: string | null;
}
