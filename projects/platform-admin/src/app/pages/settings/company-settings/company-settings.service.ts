import { Injectable, signal } from '@angular/core';

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
  logos: Record<string, string>;

  // SMTP
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

  // Integrations
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

const STORAGE_KEY = 'easyflys_company_settings';

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
  logos: {
    dark: '',
    light: '',
    favicon: '',
    login: '',
  },

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

@Injectable({
  providedIn: 'root',
})
export class CompanySettingsService {
  private readonly settingsSignal = signal<CompanySettingsData>(this.loadFromSession());
  readonly settings = this.settingsSignal.asReadonly();

  private loadFromSession(): CompanySettingsData {
    if (typeof window === 'undefined') return INITIAL_COMPANY_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...INITIAL_COMPANY_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading company settings from storage', e);
    }
    return INITIAL_COMPANY_SETTINGS;
  }

  private saveToSession(data: CompanySettingsData): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Error persisting company settings to storage', e);
    }
  }

  updateSettings(data: Partial<CompanySettingsData>): CompanySettingsData {
    const updated: CompanySettingsData = {
      ...this.settingsSignal(),
      ...data,
    };
    this.settingsSignal.set(updated);
    this.saveToSession(updated);
    return updated;
  }
}
