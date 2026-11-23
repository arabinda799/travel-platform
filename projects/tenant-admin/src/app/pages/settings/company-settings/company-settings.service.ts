import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CompanySettingsData {
  // Company Info
  companyName: string;
  legalName: string;
  gstNumber: string;
  gstStateCode: string;
  gstEmail: string;
  gstPhone: string;
  tanNumber: string;
  ciNumber: string;
  panNumber: string;
  address: string;
  zipCode: string;
  country: string;
  state: string;
  city: string;

  // Localization
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  nameFormat: string;
  preferredLanguage: string;
  transactionPrefix: string;
  invoicePrefix: string;

  // Branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  footerText: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  supportTollfree: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  metaRobots: string;
  logos: { dark: string; light: string; favicon: string; login: string };

  // Integrations / SMTP
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpReplyToEmail: string;
  smtpCcEmails: string;
  smtpBccEmails: string;

  // 3rd party providers
  smsProvider: string;
  smsSenderId: string;
  smsActive: boolean;
  whatsappProvider: string;
  whatsappSenderId: string;
  whatsappActive: boolean;
  captchaProvider: string;
  captchaSiteKey: string;
  captchaSecretKey: string;
  captchaActive: boolean;
  googlePlacesKey: string;
  googlePlacesActive: boolean;

  // Security
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  twoFactorSuperadmin: boolean;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMsg: string;
}

const STORAGE_KEY = 'tenant_admin_company_settings';

export const INITIAL_COMPANY_SETTINGS: CompanySettingsData = {
  companyName: 'EasyFlys Technologies Pvt. Ltd.',
  legalName: 'EasyFlys Technologies Private Limited',
  gstNumber: '27ABCDE1234F1Z5',
  gstStateCode: '27',
  gstEmail: 'gst@easyflys.com',
  gstPhone: '+91 98765 43210',
  tanNumber: 'MUMA12345F',
  ciNumber: 'U74999MH2020PTC123456',
  panNumber: 'ABCDE1234F',
  address: 'Level 8, Cyber Tower, BKC, Bandra East',
  zipCode: '400051',
  country: 'India',
  state: 'Maharashtra',
  city: 'Mumbai',

  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  nameFormat: 'FIRST_LAST',
  preferredLanguage: 'en-US',
  transactionPrefix: 'TXN',
  invoicePrefix: 'INV',

  primaryColor: '#F1C49D',
  secondaryColor: '#E57514',
  accentColor: '#FFF3E9',
  backgroundColor: '#ffffff',
  textColor: '#212529',
  footerText: '© 2026 EasyFlys. All rights reserved.',
  supportEmail: 'support@easyflys.com',
  supportPhone: '+91 98765 43210',
  supportWhatsapp: '+91 98765 43210',
  supportTollfree: '1800-120-0000',
  facebook: 'https://facebook.com/easyflys',
  twitter: 'https://twitter.com/easyflys',
  instagram: 'https://instagram.com/easyflys',
  linkedin: 'https://linkedin.com/company/easyflys',
  youtube: '',
  metaTitle: 'EasyFlys — Travel & Hotel Booking Platform',
  metaKeywords: 'travel, booking, flights, hotels, holiday packages',
  metaDescription: 'Book flights, hotels, and customizable holiday packages worldwide.',
  metaRobots: 'INDEX, FOLLOW',
  logos: { dark: '', light: '', favicon: '', login: '' },

  smtpHost: 'smtp.easyflys.com',
  smtpPort: 465,
  smtpUsername: 'notifications@easyflys.com',
  smtpPassword: '',
  smtpSecure: true,
  smtpFromEmail: 'noreply@easyflys.com',
  smtpFromName: 'EasyFlys Travel',
  smtpReplyToEmail: 'support@easyflys.com',
  smtpCcEmails: '',
  smtpBccEmails: '',

  smsProvider: 'msg91',
  smsSenderId: 'EASFLY',
  smsActive: true,
  whatsappProvider: 'twilio',
  whatsappSenderId: '+919876543210',
  whatsappActive: true,
  captchaProvider: 'turnstile',
  captchaSiteKey: '',
  captchaSecretKey: '',
  captchaActive: false,
  googlePlacesKey: '',
  googlePlacesActive: false,

  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  twoFactorSuperadmin: true,

  maintenanceMode: false,
  maintenanceMsg: 'We are currently performing scheduled maintenance. We will be back shortly.',
};

@Injectable({ providedIn: 'root' })
export class CompanySettingsService {
  private readonly _settings = signal<CompanySettingsData>(this.loadFromStorage());
  private readonly _loading = signal(false);

  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadFromStorage(): CompanySettingsData {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return { ...INITIAL_COMPANY_SETTINGS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    this.persist(INITIAL_COMPANY_SETTINGS);
    return INITIAL_COMPANY_SETTINGS;
  }

  private persist(data: CompanySettingsData): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }

  load(): Observable<CompanySettingsData> {
    const data = this.loadFromStorage();
    this._settings.set(data);
    return of(data);
  }

  updateSettings(data: Partial<CompanySettingsData>): Observable<CompanySettingsData> {
    const updated = { ...this._settings(), ...data };
    this._settings.set(updated);
    this.persist(updated);
    return of(updated);
  }
}
