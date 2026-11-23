import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type VendorServiceType = 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
export type VendorMode = 'LIVE' | 'TEST';
export type VendorAuthType = 'API_KEY' | 'BASIC_AUTH' | 'BEARER_TOKEN';
export type VendorHealth = 'Healthy' | 'Degraded' | 'Down';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column({ type: 'simple-json', default: '[]' }) services: VendorServiceType[];
  @Column({ default: 'TEST' }) mode: VendorMode;
  @Column({ default: '' }) apiUrl: string;
  @Column({ default: 'API_KEY' }) authType: VendorAuthType;
  @Column({ type: 'simple-json', default: '{}' }) credentials: Record<string, string>;
  @Column({ default: 0 }) latencyMs: number;
  @Column({ default: 'Healthy' }) healthStatus: VendorHealth;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() lastSync: Date;
}
