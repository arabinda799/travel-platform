import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type FirmType = 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'PVT_LTD' | 'LLP';
export type PgOwner = 'PLATFORM' | 'TENANT';
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';

export interface TenantBranding {
  web: {
    logos: { dark: string | null; light: string | null; favicon: string | null; loginBg: string | null };
    colors: { primary: string; secondary: string; accent: string; background: string; backgroundSecondary: string; text: string };
  };
  app: {
    logos: { dark: string | null; light: string | null; splash: string | null };
    colors: { primary: string; secondary: string; accent: string; background: string; backgroundSecondary: string; text: string };
  };
  text: { footer: string };
  support: { email: string; phone: string; whatsapp: string; tollfree: string };
  social: { facebook: string | null; twitter: string | null; instagram: string | null; linkedin: string | null; youtube: string | null };
  meta: { title: string; keywords: string; description: string; robots: string };
}

export interface TenantSmtp {
  host: string; port: number; username: string; password: string; secure: boolean;
  fromEmail: string; fromName: string; replyToEmail: string;
}

const DEFAULT_BRANDING: TenantBranding = {
  web: {
    logos: { dark: null, light: null, favicon: null, loginBg: null },
    colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', background: '#FFFFFF', backgroundSecondary: '#F9FAFB', text: '#111827' },
  },
  app: {
    logos: { dark: null, light: null, splash: null },
    colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', background: '#FFFFFF', backgroundSecondary: '#F9FAFB', text: '#111827' },
  },
  text: { footer: '' },
  support: { email: '', phone: '', whatsapp: '', tollfree: '' },
  social: { facebook: null, twitter: null, instagram: null, linkedin: null, youtube: null },
  meta: { title: '', keywords: '', description: '', robots: 'index, follow' },
};

const DEFAULT_SMTP: TenantSmtp = { host: '', port: 587, username: '', password: '', secure: false, fromEmail: '', fromName: '', replyToEmail: '' };

@Entity('tenants')
export class TenantCompany {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() companyName: string;
  @Column({ unique: true }) companyCode: string;
  @Column({ unique: true }) domain: string;
  @Column() firmType: FirmType;
  @Column({ default: 'PLATFORM' }) pgOwner: PgOwner;
  @Column({ default: 'TRIAL' }) status: TenantStatus;
  @Column({ nullable: true, type: 'text' }) trialEndsAt: string | null;
  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true, type: 'text' }) legalName: string | null;
  @Column({ default: '' }) gstNumber: string;
  @Column({ type: 'simple-json', default: JSON.stringify(DEFAULT_BRANDING) }) branding: TenantBranding;
  @Column({ type: 'simple-json', default: JSON.stringify(DEFAULT_SMTP) }) smtp: TenantSmtp;
}
