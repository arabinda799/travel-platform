import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  BreadcrumbItem,
  ButtonComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  SwitchFieldComponent,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  META_ROBOTS_OPTIONS,
} from 'admin-core';
import { CompanySettingsService } from './company-settings.service';

export type SettingsTab =
  | 'company'
  | 'localization'
  | 'branding'
  | 'smtp'
  | 'integrations'
  | 'security'
  | 'maintenance';

interface TabItem {
  key: SettingsTab;
  label: string;
  icon: string;
}

export interface LogoConfig {
  key: string;
  label: string;
  specs: string;
  accept: string;
  previewClass: string;
  imgClass: string;
  placeholderIcon: string;
  placeholderHint: string;
}

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    SwitchFieldComponent,
  ],
  templateUrl: './company-settings.html',
  styleUrl: './company-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanySettingsComponent {
  private readonly settingsService = inject(CompanySettingsService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Settings' },
    { label: 'Company Setting' },
  ];

  readonly activeTab = signal<SettingsTab>('company');
  readonly saving = signal<boolean>(false);

  readonly tabs: TabItem[] = [
    { key: 'company', label: 'Company Info', icon: 'business' },
    { key: 'localization', label: 'Localization', icon: 'language' },
    { key: 'branding', label: 'Branding', icon: 'palette' },
    { key: 'smtp', label: 'SMTP', icon: 'email' },
    { key: 'integrations', label: 'Integrations', icon: 'extension' },
    { key: 'security', label: 'Security', icon: 'shield' },
    { key: 'maintenance', label: 'Maintenance', icon: 'construction' },
  ];

  readonly logoConfigs: LogoConfig[] = [
    {
      key: 'light',
      label: 'Light Mode Logo',
      specs: 'PNG, SVG • Max 2MB • 240×60px',
      accept: 'image/png,image/svg+xml,image/webp',
      previewClass: 'logo-preview--light',
      imgClass: '',
      placeholderIcon: 'image',
      placeholderHint: 'Click to upload light logo',
    },
    {
      key: 'dark',
      label: 'Dark Mode Logo',
      specs: 'PNG, SVG • Max 2MB • 240×60px',
      accept: 'image/png,image/svg+xml,image/webp',
      previewClass: 'logo-preview--dark',
      imgClass: '',
      placeholderIcon: 'dark_mode',
      placeholderHint: 'Click to upload dark logo',
    },
    {
      key: 'favicon',
      label: 'Favicon',
      specs: 'ICO, PNG, SVG • 32×32px or 64×64px',
      accept: 'image/x-icon,image/png,image/svg+xml',
      previewClass: 'logo-preview--favicon',
      imgClass: 'logo-img--favicon',
      placeholderIcon: 'Adjust',
      placeholderHint: '32×32px icon',
    },
    {
      key: 'login',
      label: 'Login Banner / Logo',
      specs: 'PNG, SVG, WebP • 400×120px',
      accept: 'image/png,image/svg+xml,image/webp',
      previewClass: 'logo-preview--light',
      imgClass: '',
      placeholderIcon: 'login',
      placeholderHint: 'Click to upload login logo',
    },
  ];

  // Options
  readonly dateFormatOptions = DATE_FORMAT_OPTIONS;
  readonly timeFormatOptions = TIME_FORMAT_OPTIONS;
  readonly metaRobotsOptions = META_ROBOTS_OPTIONS;

  readonly nameFormatOptions = [
    { label: 'First Last', value: 'FIRST_LAST' },
    { label: 'Last First', value: 'LAST_FIRST' },
  ];

  readonly countryOptions = [
    { label: 'India', value: 'India' },
    { label: 'United Arab Emirates', value: 'United Arab Emirates' },
    { label: 'Singapore', value: 'Singapore' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'United States', value: 'United States' },
  ];

  readonly stateOptions = [
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  ];

  readonly cityOptions = [
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'New Delhi', value: 'New Delhi' },
    { label: 'Bengaluru', value: 'Bengaluru' },
    { label: 'Kochi', value: 'Kochi' },
    { label: 'Ahmedabad', value: 'Ahmedabad' },
    { label: 'Chennai', value: 'Chennai' },
  ];

  readonly captchaProviderOptions = [
    { label: 'None', value: '' },
    { label: 'reCAPTCHA v2', value: 'recaptcha_v2' },
    { label: 'reCAPTCHA v3', value: 'recaptcha_v3' },
    { label: 'hCaptcha', value: 'hcaptcha' },
    { label: 'Cloudflare Turnstile', value: 'turnstile' },
  ];

  readonly smsProviderOptions = [
    { label: 'None', value: '' },
    { label: 'Twilio', value: 'twilio' },
    { label: 'MSG91', value: 'msg91' },
    { label: 'Fast2SMS', value: 'fast2sms' },
  ];

  /* ── Reactive Forms per Tab ────────────────────────────── */
  readonly companyForm = new FormGroup({
    companyName: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    legalName: new FormControl('', Validators.maxLength(150)),
    gstNumber: new FormControl('', [Validators.required, Validators.maxLength(30)]),
    gstStateCode: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    gstEmail: new FormControl('', [Validators.email, Validators.maxLength(100)]),
    gstPhone: new FormControl('', Validators.maxLength(20)),
    tanNumber: new FormControl('', Validators.maxLength(15)),
    ciNumber: new FormControl('', Validators.maxLength(21)),
    panNumber: new FormControl('', Validators.maxLength(20)),
    address: new FormControl(''),
    zipCode: new FormControl('', Validators.maxLength(20)),
    country: new FormControl('India'),
    state: new FormControl('Maharashtra'),
    city: new FormControl('Mumbai'),
  });

  readonly localizationForm = new FormGroup({
    timezone: new FormControl('Asia/Kolkata'),
    dateFormat: new FormControl('DD/MM/YYYY', Validators.required),
    timeFormat: new FormControl('12h', Validators.required),
    nameFormat: new FormControl('FIRST_LAST', Validators.required),
    preferredLanguage: new FormControl('en-US'),
    transactionPrefix: new FormControl('TXN', Validators.maxLength(10)),
    invoicePrefix: new FormControl('INV', Validators.maxLength(10)),
  });

  readonly brandingForm = new FormGroup({
    primaryColor: new FormControl('#F1C49D'),
    secondaryColor: new FormControl('#E57514'),
    accentColor: new FormControl('#FFF3E9'),
    backgroundColor: new FormControl('#ffffff'),
    textColor: new FormControl('#212529'),
    footerText: new FormControl(''),
    supportEmail: new FormControl('', Validators.email),
    supportPhone: new FormControl(''),
    supportWhatsapp: new FormControl(''),
    supportTollfree: new FormControl(''),
    facebook: new FormControl(''),
    twitter: new FormControl(''),
    instagram: new FormControl(''),
    linkedin: new FormControl(''),
    youtube: new FormControl(''),
    metaTitle: new FormControl(''),
    metaKeywords: new FormControl(''),
    metaDescription: new FormControl(''),
    metaRobots: new FormControl('INDEX, FOLLOW'),
  });

  readonly smtpForm = new FormGroup({
    smtpHost: new FormControl('', Validators.required),
    smtpPort: new FormControl('465', Validators.required),
    smtpUsername: new FormControl('', Validators.required),
    smtpPassword: new FormControl(''),
    smtpSecure: new FormControl(true),
    smtpFromEmail: new FormControl('', [Validators.required, Validators.email]),
    smtpFromName: new FormControl('', Validators.required),
    smtpReplyToEmail: new FormControl('', Validators.email),
    smtpCcEmails: new FormControl(''),
    smtpBccEmails: new FormControl(''),
  });

  readonly integrationsForm = new FormGroup({
    smsProvider: new FormControl(''),
    smsSenderId: new FormControl(''),
    smsActive: new FormControl(false),
    whatsappProvider: new FormControl(''),
    whatsappSenderId: new FormControl(''),
    whatsappActive: new FormControl(false),
    captchaProvider: new FormControl(''),
    captchaSiteKey: new FormControl(''),
    captchaSecretKey: new FormControl(''),
    captchaActive: new FormControl(false),
    googlePlacesKey: new FormControl(''),
    googlePlacesActive: new FormControl(false),
  });

  readonly securityForm = new FormGroup({
    maxLoginAttempts: new FormControl('5', Validators.required),
    lockoutDurationMinutes: new FormControl('15', Validators.required),
    twoFactorSuperadmin: new FormControl(true),
  });

  readonly maintenanceForm = new FormGroup({
    maintenanceMode: new FormControl(false),
    maintenanceMsg: new FormControl(''),
  });

  readonly logoPreviews = signal<Record<string, string>>({
    dark: '',
    light: '',
    favicon: '',
    login: '',
  });

  /* ── Reactive Form Value Signals for Live Previews ─────── */
  private readonly companyFormValue = toSignal(
    this.companyForm.valueChanges.pipe(startWith(this.companyForm.getRawValue())),
  );

  private readonly brandingFormValue = toSignal(
    this.brandingForm.valueChanges.pipe(startWith(this.brandingForm.getRawValue())),
  );

  readonly displayCompanyName = computed(
    () => this.companyFormValue()?.companyName?.trim() || 'Your Company',
  );

  readonly displayGstNumber = computed(
    () => this.companyFormValue()?.gstNumber?.trim() || '',
  );

  readonly brandColors = computed(() => {
    const b = this.brandingFormValue();
    return {
      primary: b?.primaryColor || '#F1C49D',
      secondary: b?.secondaryColor || '#E57514',
      accent: b?.accentColor || '#FFF3E9',
      background: b?.backgroundColor || '#ffffff',
      text: b?.textColor || '#212529',
    };
  });

  constructor() {
    this.hydrateFromService();
  }

  private hydrateFromService(): void {
    const s = this.settingsService.settings();
    this.companyForm.patchValue({
      companyName: s.companyName,
      legalName: s.legalName,
      gstNumber: s.gstNumber,
      gstStateCode: s.gstStateCode,
      gstEmail: s.gstEmail,
      gstPhone: s.gstPhone,
      tanNumber: s.tanNumber,
      ciNumber: s.ciNumber,
      panNumber: s.panNumber,
      address: s.address,
      zipCode: s.zipCode,
      country: s.country,
      state: s.state,
      city: s.city,
    });

    this.localizationForm.patchValue({
      timezone: s.timezone,
      dateFormat: s.dateFormat,
      timeFormat: s.timeFormat,
      nameFormat: s.nameFormat,
      preferredLanguage: s.preferredLanguage,
      transactionPrefix: s.transactionPrefix,
      invoicePrefix: s.invoicePrefix,
    });

    this.brandingForm.patchValue({
      primaryColor: s.primaryColor,
      secondaryColor: s.secondaryColor,
      accentColor: s.accentColor,
      backgroundColor: s.backgroundColor,
      textColor: s.textColor,
      footerText: s.footerText,
      supportEmail: s.supportEmail,
      supportPhone: s.supportPhone,
      supportWhatsapp: s.supportWhatsapp,
      supportTollfree: s.supportTollfree,
      facebook: s.facebook,
      twitter: s.twitter,
      instagram: s.instagram,
      linkedin: s.linkedin,
      youtube: s.youtube,
      metaTitle: s.metaTitle,
      metaKeywords: s.metaKeywords,
      metaDescription: s.metaDescription,
      metaRobots: s.metaRobots,
    });
    this.logoPreviews.set({ ...s.logos });

    this.smtpForm.patchValue({
      smtpHost: s.smtpHost,
      smtpPort: String(s.smtpPort),
      smtpUsername: s.smtpUsername,
      smtpPassword: s.smtpPassword,
      smtpSecure: s.smtpSecure,
      smtpFromEmail: s.smtpFromEmail,
      smtpFromName: s.smtpFromName,
      smtpReplyToEmail: s.smtpReplyToEmail,
      smtpCcEmails: s.smtpCcEmails,
      smtpBccEmails: s.smtpBccEmails,
    });

    this.integrationsForm.patchValue({
      smsProvider: s.smsProvider,
      smsSenderId: s.smsSenderId,
      smsActive: s.smsActive,
      whatsappProvider: s.whatsappProvider,
      whatsappSenderId: s.whatsappSenderId,
      whatsappActive: s.whatsappActive,
      captchaProvider: s.captchaProvider,
      captchaSiteKey: s.captchaSiteKey,
      captchaSecretKey: s.captchaSecretKey,
      captchaActive: s.captchaActive,
      googlePlacesKey: s.googlePlacesKey,
      googlePlacesActive: s.googlePlacesActive,
    });

    this.securityForm.patchValue({
      maxLoginAttempts: String(s.maxLoginAttempts),
      lockoutDurationMinutes: String(s.lockoutDurationMinutes),
      twoFactorSuperadmin: s.twoFactorSuperadmin,
    });

    this.maintenanceForm.patchValue({
      maintenanceMode: s.maintenanceMode,
      maintenanceMsg: s.maintenanceMsg,
    });
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  onUploadLogo(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.logoPreviews.update(prev => ({
          ...prev,
          [key]: (e.target?.result as string) || '',
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  onRemoveLogo(key: string): void {
    this.logoPreviews.update(prev => ({
      ...prev,
      [key]: '',
    }));
  }

  onColorInput(controlName: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.brandingForm.controls[controlName].setValue(value);
  }

  onSave(): void {
    const tabForms: Record<SettingsTab, FormGroup> = {
      company: this.companyForm,
      localization: this.localizationForm,
      branding: this.brandingForm,
      smtp: this.smtpForm,
      integrations: this.integrationsForm,
      security: this.securityForm,
      maintenance: this.maintenanceForm,
    };

    Object.values(tabForms).forEach(f => {
      f.markAllAsTouched();
      f.updateValueAndValidity();
    });

    const invalidTab = this.tabs.find(t => tabForms[t.key].invalid);
    if (invalidTab) {
      this.activeTab.set(invalidTab.key);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields before saving.',
        life: 4000,
      });
      return;
    }

    this.saving.set(true);
    const c = this.companyForm.getRawValue();
    const l = this.localizationForm.getRawValue();
    const b = this.brandingForm.getRawValue();
    const s = this.smtpForm.getRawValue();
    const i = this.integrationsForm.getRawValue();
    const sec = this.securityForm.getRawValue();
    const m = this.maintenanceForm.getRawValue();

    this.settingsService.updateSettings({
      companyName: (c.companyName || '').trim(),
      legalName: (c.legalName || '').trim(),
      gstNumber: (c.gstNumber || '').trim(),
      gstStateCode: (c.gstStateCode || '').trim(),
      gstEmail: (c.gstEmail || '').trim(),
      gstPhone: (c.gstPhone || '').trim(),
      tanNumber: (c.tanNumber || '').trim(),
      ciNumber: (c.ciNumber || '').trim(),
      panNumber: (c.panNumber || '').trim(),
      address: (c.address || '').trim(),
      zipCode: (c.zipCode || '').trim(),
      country: c.country || 'India',
      state: c.state || 'Maharashtra',
      city: c.city || 'Mumbai',

      timezone: (l.timezone || '').trim(),
      dateFormat: l.dateFormat || 'DD/MM/YYYY',
      timeFormat: l.timeFormat || '12h',
      nameFormat: l.nameFormat || 'FIRST_LAST',
      preferredLanguage: (l.preferredLanguage || '').trim(),
      transactionPrefix: (l.transactionPrefix || '').trim(),
      invoicePrefix: (l.invoicePrefix || '').trim(),

      primaryColor: b.primaryColor || '#F1C49D',
      secondaryColor: b.secondaryColor || '#E57514',
      accentColor: b.accentColor || '#FFF3E9',
      backgroundColor: b.backgroundColor || '#ffffff',
      textColor: b.textColor || '#212529',
      footerText: (b.footerText || '').trim(),
      supportEmail: (b.supportEmail || '').trim(),
      supportPhone: (b.supportPhone || '').trim(),
      supportWhatsapp: (b.supportWhatsapp || '').trim(),
      supportTollfree: (b.supportTollfree || '').trim(),
      facebook: (b.facebook || '').trim(),
      twitter: (b.twitter || '').trim(),
      instagram: (b.instagram || '').trim(),
      linkedin: (b.linkedin || '').trim(),
      youtube: (b.youtube || '').trim(),
      metaTitle: (b.metaTitle || '').trim(),
      metaKeywords: (b.metaKeywords || '').trim(),
      metaDescription: (b.metaDescription || '').trim(),
      metaRobots: b.metaRobots || 'INDEX, FOLLOW',
      logos: this.logoPreviews(),

      smtpHost: (s.smtpHost || '').trim(),
      smtpPort: Number(s.smtpPort) || 465,
      smtpUsername: (s.smtpUsername || '').trim(),
      smtpPassword: s.smtpPassword || '',
      smtpSecure: Boolean(s.smtpSecure),
      smtpFromEmail: (s.smtpFromEmail || '').trim(),
      smtpFromName: (s.smtpFromName || '').trim(),
      smtpReplyToEmail: (s.smtpReplyToEmail || '').trim(),
      smtpCcEmails: (s.smtpCcEmails || '').trim(),
      smtpBccEmails: (s.smtpBccEmails || '').trim(),

      smsProvider: i.smsProvider || '',
      smsSenderId: (i.smsSenderId || '').trim(),
      smsActive: Boolean(i.smsActive),
      whatsappProvider: i.whatsappProvider || '',
      whatsappSenderId: (i.whatsappSenderId || '').trim(),
      whatsappActive: Boolean(i.whatsappActive),
      captchaProvider: i.captchaProvider || '',
      captchaSiteKey: (i.captchaSiteKey || '').trim(),
      captchaSecretKey: (i.captchaSecretKey || '').trim(),
      captchaActive: Boolean(i.captchaActive),
      googlePlacesKey: (i.googlePlacesKey || '').trim(),
      googlePlacesActive: Boolean(i.googlePlacesActive),

      maxLoginAttempts: Number(sec.maxLoginAttempts) || 5,
      lockoutDurationMinutes: Number(sec.lockoutDurationMinutes) || 15,
      twoFactorSuperadmin: Boolean(sec.twoFactorSuperadmin),

      maintenanceMode: Boolean(m.maintenanceMode),
      maintenanceMsg: (m.maintenanceMsg || '').trim(),
    });

    setTimeout(() => {
      this.saving.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Company settings updated successfully.',
        life: 4000,
      });
    }, 400);
  }
}
