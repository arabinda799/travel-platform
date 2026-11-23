import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type PricingTarget = 'B2B' | 'B2C' | 'Corporate' | 'All';
export type HotelMarkupType = 'Per Night' | 'Per Stay' | 'Percentage' | 'Fixed';
export type DisplayMarkup = 'In Tax' | 'In Room Rate' | 'Separate Line Item';

@Entity('hotel_markups')
export class HotelMarkup {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() markupFor: PricingTarget;
  @Column({ type: 'simple-json', default: '[]' }) regionTypes: string[];
  @Column() hotelMarkupType: HotelMarkupType;
  @Column() displayMarkup: DisplayMarkup;
  @Column({ type: 'float', default: 0 }) value: number;
  @Column({ default: 'Active' }) status: 'Active' | 'Inactive';
  @CreateDateColumn() createdDate: Date;
  @UpdateDateColumn() updatedDate: Date;
}

@Entity('hotel_discounts')
export class HotelDiscount {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() markupFor: PricingTarget;
  @Column({ type: 'simple-json', default: '[]' }) regionTypes: string[];
  @Column({ type: 'float', default: 0 }) value: number;
  @Column({ type: 'float', nullable: true }) maxLimit: number | null;
  @Column({ default: 'Active' }) status: 'Active' | 'Inactive';
  @CreateDateColumn() createdDate: Date;
  @UpdateDateColumn() updatedDate: Date;
}
