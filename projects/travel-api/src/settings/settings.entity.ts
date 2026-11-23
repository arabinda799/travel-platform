import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

export interface CompanyLogos { dark: string | null; light: string | null; favicon: string | null; loginBg: string | null; }
export interface CompanyColors { primary: string; secondary: string; accent: string; }
export interface CompanyMeta { title: string; description: string; keywords: string; robots: string; }
export interface CompanySupport { email: string; phone: string; whatsapp: string; tollfree: string; }
export interface CompanySocial { facebook: string | null; twitter: string | null; instagram: string | null; linkedin: string | null; youtube: string | null; }
export interface CompanySmtp { host: string; port: number; username: string; secure: boolean; fromEmail: string; fromName: string; replyToEmail: string; }

export interface CompanySettings {
  companyName: string;
  companyCode: string;
  legalName: string | null;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  logos: CompanyLogos;
  colors: CompanyColors;
  meta: CompanyMeta;
  support: CompanySupport;
  social: CompanySocial;
  smtp: CompanySmtp;
}

export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'EasyFlys',
  companyCode: 'EASYFLYS',
  legalName: 'EasyFlys Technologies Pvt. Ltd.',
  gstNumber: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  logos: { dark: null, light: null, favicon: null, loginBg: null },
  colors: { primary: '#8323A1', secondary: '#F56822', accent: '#D03D4E' },
  meta: { title: 'EasyFlys', description: 'Travel Booking Platform', keywords: 'travel, booking, flights, hotels', robots: 'index, follow' },
  support: { email: 'support@easyflys.com', phone: '', whatsapp: '', tollfree: '' },
  social: { facebook: null, twitter: null, instagram: null, linkedin: null, youtube: null },
  smtp: { host: 'smtp.example.com', port: 465, username: '', secure: true, fromEmail: 'noreply@easyflys.com', fromName: 'EasyFlys', replyToEmail: 'support@easyflys.com' },
};

@Entity('settings')
export class SettingsEntity {
  @PrimaryColumn() id: string;
  @Column() companyName: string;
  @Column() companyCode: string;
  @Column({ nullable: true, type: 'text' }) legalName: string | null;
  @Column({ default: '' }) gstNumber: string;
  @Column({ default: '' }) phone: string;
  @Column({ default: '' }) email: string;
  @Column({ default: '' }) address: string;
  @Column({ default: '' }) website: string;
  @Column({ type: 'simple-json' }) logos: CompanyLogos;
  @Column({ type: 'simple-json' }) colors: CompanyColors;
  @Column({ type: 'simple-json' }) meta: CompanyMeta;
  @Column({ type: 'simple-json' }) support: CompanySupport;
  @Column({ type: 'simple-json' }) social: CompanySocial;
  @Column({ type: 'simple-json' }) smtp: CompanySmtp;
  @UpdateDateColumn() updatedAt: Date;
}
