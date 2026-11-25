import { Injectable, computed, signal, inject } from '@angular/core';
import { Observable, of, tap, catchError, take } from 'rxjs';
import { ApiService } from 'admin-core';

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
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;

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
  countryId: null,
  stateId: null,
  cityId: null,

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
  private readonly api = inject(ApiService);
  private readonly _settings = signal<CompanySettingsData>(INITIAL_COMPANY_SETTINGS);
  private readonly _loading = signal(false);
  private readonly _loadFailed = signal(false);

  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadFailed = this._loadFailed.asReadonly();

  readonly maintenanceMode = computed(
    () => this._loadFailed() || Boolean(this._settings().maintenanceMode),
  );
  readonly maintenanceMsg = computed(() => {
    if (this._loadFailed()) {
      return 'Unable to connect to tenant services. Please check back shortly.';
    }
    return (
      this._settings().maintenanceMsg ||
      'We are currently performing scheduled maintenance. Please check back shortly.'
    );
  });

  load(): Observable<CompanySettingsData> {
    this._loading.set(true);
    return this.api.get<any>('/tenant/settings').pipe(
      tap(backendConfig => {
        const raw = backendConfig?.data ?? backendConfig;
        const merged = { ...INITIAL_COMPANY_SETTINGS, ...(raw || {}) };
        this._settings.set(merged);
        this._loading.set(false);
        this._loadFailed.set(false);
      }),
      catchError(() => {
        this._loading.set(false);
        this._loadFailed.set(true);
        return of(this._settings());
      }),
    );
  }

  updateSettings(data: Partial<CompanySettingsData>): Observable<CompanySettingsData> {
    const updated = { ...this._settings(), ...data };
    this._settings.set(updated);
    return this.api.patch<any>('/tenant/settings', data).pipe(
      tap(saved => {
        const raw = saved?.data ?? saved;
        const merged = { ...this._settings(), ...(raw || {}) };
        this._settings.set(merged);
      }),
      catchError(() => of(updated)),
    );
  }

  sendTestEmail(smtpConfig: any): Observable<any> {
    return this.api.post<any>('/tenant/settings/smtp/test', smtpConfig).pipe(take(1));
  }
}
