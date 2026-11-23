import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseApiCrudService<TenantCompany> {
  protected readonly endpoint = '/tenants';

  readonly companies = this.items;

  updateBranding(id: string, branding: TenantBranding): Observable<TenantCompany> {
    return this.api.patch<TenantCompany>(`${this.endpoint}/${id}/branding`, branding).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(c => c.id === id ? updated : c))),
    );
  }

  updateSmtp(id: string, smtp: TenantSmtp): Observable<TenantCompany> {
    return this.api.patch<TenantCompany>(`${this.endpoint}/${id}/smtp`, smtp).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(c => c.id === id ? updated : c))),
    );
  }
}
