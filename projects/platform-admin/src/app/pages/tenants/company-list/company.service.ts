import { Injectable, signal } from '@angular/core';

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

export interface TenantCompany {
  id: string;
  companyName: string;
  companyCode: string;
  domain: string;
  firmType: FirmType;
  pgOwner: PgOwner;
  status: TenantStatus;
  trialEndsAt: string | null;
  createdAt: string;
  legalName: string | null;
  gstNumber: string;
  branding: TenantBranding;
  smtp: TenantSmtp;
}

export const DEFAULT_BRANDING: TenantBranding = {
  web: {
    logos: { dark: null, light: null, favicon: null, loginBg: null },
    colors: { primary: '#8323A1', secondary: '#F56822', accent: '#D03D4E', background: '#F8F9FA', backgroundSecondary: '#FFFFFF', text: '#212529' },
  },
  app: {
    logos: { dark: null, light: null, splash: null },
    colors: { primary: '#8323A1', secondary: '#F56822', accent: '#D03D4E', background: '#F8F9FA', backgroundSecondary: '#FFFFFF', text: '#212529' },
  },
  text: { footer: '© 2026 All rights reserved.' },
  support: { email: 'support@tenant.com', phone: '+910000000000', whatsapp: '+910000000000', tollfree: '1800-000-0000' },
  social: { facebook: null, twitter: null, instagram: null, linkedin: null, youtube: null },
  meta: { title: 'Travel Booking', keywords: 'travel, booking', description: 'Advanced Travel Booking', robots: 'index, follow' },
};

export const DEFAULT_SMTP: TenantSmtp = {
  host: 'smtp.example.com', port: 465, username: 'admin@example.com', password: '',
  secure: true, fromEmail: 'noreply@example.com', fromName: 'Travel', replyToEmail: 'support@example.com',
};

const MOCK_COMPANIES: TenantCompany[] = [
  {
    id: 'ten-001', companyName: 'Nexus Travels Pvt. Ltd.', companyCode: 'NEXUS', domain: 'nexustravels.com',
    firmType: 'PVT_LTD', pgOwner: 'PLATFORM', status: 'ACTIVE', trialEndsAt: null, createdAt: '2025-02-10',
    legalName: 'Nexus Travels Private Limited', gstNumber: '27AABCN1234F1Z5',
    branding: { ...DEFAULT_BRANDING, web: { ...DEFAULT_BRANDING.web, colors: { ...DEFAULT_BRANDING.web.colors, primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' } }, text: { footer: '© 2026 Nexus Travels. All rights reserved.' }, support: { email: 'support@nexustravels.com', phone: '+919876543210', whatsapp: '+919876543210', tollfree: '1800-100-100' }, meta: { title: 'Nexus Travels', keywords: 'nexus, travel, holiday', description: 'Premium travel booking platform', robots: 'index, follow' }, social: { facebook: 'https://facebook.com/nexustravels', twitter: null, instagram: 'https://instagram.com/nexustravels', linkedin: null, youtube: null } },
    smtp: { ...DEFAULT_SMTP, host: 'smtp.nexustravels.com', fromEmail: 'noreply@nexustravels.com', fromName: 'Nexus Travels' },
  },
  {
    id: 'ten-002', companyName: 'Horizon Tours LLP', companyCode: 'HORIZON', domain: 'horizontours.in',
    firmType: 'LLP', pgOwner: 'TENANT', status: 'ACTIVE', trialEndsAt: null, createdAt: '2025-04-01',
    legalName: 'Horizon Tours LLP', gstNumber: '19AACHH5678G1Z3',
    branding: { ...DEFAULT_BRANDING, web: { ...DEFAULT_BRANDING.web, colors: { ...DEFAULT_BRANDING.web.colors, primary: '#6366F1', secondary: '#EC4899', accent: '#14B8A6' } }, text: { footer: '© 2026 Horizon Tours. All rights reserved.' }, support: { email: 'hello@horizontours.in', phone: '+918800001234', whatsapp: '+918800001234', tollfree: '' }, meta: { title: 'Horizon Tours', keywords: 'horizon, tours, travels', description: 'Explore with Horizon Tours', robots: 'index, follow' }, social: { facebook: null, twitter: 'https://twitter.com/horizontours', instagram: null, linkedin: null, youtube: null } },
    smtp: { ...DEFAULT_SMTP, host: 'smtp.horizontours.in', fromEmail: 'noreply@horizontours.in', fromName: 'Horizon Tours' },
  },
  {
    id: 'ten-003', companyName: 'Wanderlust Journeys', companyCode: 'WLUST', domain: 'wanderlustjourneys.com',
    firmType: 'PROPRIETORSHIP', pgOwner: 'PLATFORM', status: 'TRIAL', trialEndsAt: '2026-12-31', createdAt: '2026-10-15',
    legalName: null, gstNumber: '', branding: DEFAULT_BRANDING, smtp: DEFAULT_SMTP,
  },
  {
    id: 'ten-004', companyName: 'Skyline Travel Solutions', companyCode: 'SKYLINE', domain: 'skylinetravel.com',
    firmType: 'PVT_LTD', pgOwner: 'PLATFORM', status: 'INACTIVE', trialEndsAt: null, createdAt: '2024-11-20',
    legalName: 'Skyline Travel Solutions Pvt. Ltd.', gstNumber: '07AABCS9012H1Z8',
    branding: { ...DEFAULT_BRANDING, web: { ...DEFAULT_BRANDING.web, colors: { ...DEFAULT_BRANDING.web.colors, primary: '#0EA5E9', secondary: '#F97316', accent: '#8B5CF6' } }, text: { footer: '© 2026 Skyline Travel. All rights reserved.' }, support: { ...DEFAULT_BRANDING.support, email: 'support@skylinetravel.com' }, meta: { ...DEFAULT_BRANDING.meta, title: 'Skyline Travel' }, social: { ...DEFAULT_BRANDING.social, linkedin: 'https://linkedin.com/company/skylinetravel' } },
    smtp: { ...DEFAULT_SMTP, host: 'smtp.skylinetravel.com', fromEmail: 'noreply@skylinetravel.com', fromName: 'Skyline Travel' },
  },
  {
    id: 'ten-005', companyName: 'TravelEase Partners', companyCode: 'TEASE', domain: 'traveleasepartners.in',
    firmType: 'PARTNERSHIP', pgOwner: 'TENANT', status: 'ACTIVE', trialEndsAt: null, createdAt: '2025-07-05',
    legalName: 'TravelEase Partners', gstNumber: '33AABCT3456I1Z2',
    branding: DEFAULT_BRANDING, smtp: DEFAULT_SMTP,
  },
];

const STORAGE_KEY = 'easyflys_tenant_companies';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  readonly companies = signal<TenantCompany[]>(this._load());

  private _load(): TenantCompany[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : MOCK_COMPANIES;
    } catch {
      return MOCK_COMPANIES;
    }
  }

  private _save(list: TenantCompany[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
    this.companies.set(list);
  }

  add(payload: Omit<TenantCompany, 'id' | 'createdAt'>): TenantCompany {
    const item: TenantCompany = { ...payload, id: `ten-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    this._save([...this.companies(), item]);
    return item;
  }

  update(id: string, payload: Partial<Omit<TenantCompany, 'id' | 'createdAt'>>): void {
    this._save(this.companies().map(c => c.id === id ? { ...c, ...payload } : c));
  }

  updateBranding(id: string, branding: TenantBranding): void {
    this._save(this.companies().map(c => c.id === id ? { ...c, branding } : c));
  }

  updateSmtp(id: string, smtp: TenantSmtp): void {
    this._save(this.companies().map(c => c.id === id ? { ...c, smtp } : c));
  }

  delete(id: string): void {
    this._save(this.companies().filter(c => c.id !== id));
  }
}
