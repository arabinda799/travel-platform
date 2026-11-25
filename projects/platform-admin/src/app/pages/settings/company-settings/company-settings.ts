import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
  MediaUploadService,
  ApiService,
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
export class CompanySettingsComponent implements OnInit {
  private readonly settingsService = inject(CompanySettingsService);
  private readonly mediaUploadService = inject(MediaUploadService);
  private readonly apiService = inject(ApiService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Settings' },
    { label: 'Company Setting' },
  ];

  readonly activeTab = signal<SettingsTab>('company');
  readonly saving = signal<boolean>(false);
  readonly sendingTestEmail = signal(false);

  sendTestEmail(): void {
    this.sendingTestEmail.set(true);
    const s = this.smtpForm.getRawValue();
    this.settingsService.sendTestEmail(s).subscribe({
      next: () => {
        this.sendingTestEmail.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Email Sent',
          detail: 'Test email has been queued / sent successfully.',
        });
      },
      error: (err: any) => {
        this.sendingTestEmail.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'SMTP Error',
          detail: err?.error?.message || 'Could not send test email. Check your SMTP settings.',
        });
      },
    });
  }

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

  readonly countryOptions = signal<{ label: string; value: string }[]>([]);
  readonly stateOptions = signal<{ label: string; value: string }[]>([]);
  readonly cityOptions = signal<{ label: string; value: string }[]>([]);
  private readonly rawCountries = signal<any[]>([]);
  private readonly rawStates = signal<any[]>([]);
  private readonly rawCities = signal<any[]>([]);

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
    countryId: new FormControl<string | null>(null),
    stateId: new FormControl<string | null>(null),
    cityId: new FormControl<string | null>(null),
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

  readonly uploadingLogo = signal<Record<string, boolean>>({
    dark: false,
    light: false,
    favicon: false,
    login: false,
  });

  resolveLogoUrl(url: string): string {
    return this.mediaUploadService.resolveUrl(url);
  }

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

  ngOnInit(): void {
    this.setupGeographyListeners();
    this.settingsService.load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => this.hydrateFromService(s));
  }

  private setupGeographyListeners(): void {
    this.companyForm.controls.countryId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(countryId => {
        if (countryId) {
          const match = this.rawCountries().find(c => c.id === countryId);
          this.companyForm.controls.country.setValue(match ? match.name : '', { emitEvent: false });
          this.companyForm.controls.stateId.setValue(null, { emitEvent: false });
          this.companyForm.controls.state.setValue('', { emitEvent: false });
          this.companyForm.controls.cityId.setValue(null, { emitEvent: false });
          this.companyForm.controls.city.setValue('', { emitEvent: false });
          this.stateOptions.set([]);
          this.cityOptions.set([]);
          this.loadStates(countryId);
        } else {
          this.companyForm.controls.country.setValue('', { emitEvent: false });
          this.companyForm.controls.stateId.setValue(null, { emitEvent: false });
          this.companyForm.controls.state.setValue('', { emitEvent: false });
          this.companyForm.controls.cityId.setValue(null, { emitEvent: false });
          this.companyForm.controls.city.setValue('', { emitEvent: false });
          this.stateOptions.set([]);
          this.cityOptions.set([]);
        }
      });

    this.companyForm.controls.stateId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stateId => {
        if (stateId) {
          const match = this.rawStates().find(s => s.id === stateId);
          this.companyForm.controls.state.setValue(match ? match.name : '', { emitEvent: false });
          this.companyForm.controls.cityId.setValue(null, { emitEvent: false });
          this.companyForm.controls.city.setValue('', { emitEvent: false });
          this.cityOptions.set([]);
          this.loadCities(stateId);
        } else {
          this.companyForm.controls.state.setValue('', { emitEvent: false });
          this.companyForm.controls.cityId.setValue(null, { emitEvent: false });
          this.companyForm.controls.city.setValue('', { emitEvent: false });
          this.cityOptions.set([]);
        }
      });

    this.companyForm.controls.cityId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cityId => {
        if (cityId) {
          const match = this.rawCities().find(c => c.id === cityId);
          this.companyForm.controls.city.setValue(match ? match.name : '', { emitEvent: false });
        } else {
          this.companyForm.controls.city.setValue('', { emitEvent: false });
        }
      });
  }

  private loadCountries(selectedCountryId?: string | null, selectedCountryName?: string, stateId?: string | null, stateName?: string, cityId?: string | null, cityName?: string): void {
    this.apiService.get<any[]>('/geography/countries')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries: any) => {
          const list = Array.isArray(countries) ? countries : (countries?.data || []);
          this.rawCountries.set(list);
          this.countryOptions.set(list.map((c: any) => ({ label: c.name, value: c.id })));

          let targetCountryId = selectedCountryId;
          if (!targetCountryId && selectedCountryName) {
            const found = list.find((c: any) => c.name.toLowerCase() === selectedCountryName.toLowerCase());
            if (found) targetCountryId = found.id;
          }

          if (targetCountryId) {
            this.companyForm.controls.countryId.setValue(targetCountryId, { emitEvent: false });
            const match = list.find((c: any) => c.id === targetCountryId);
            if (match) this.companyForm.controls.country.setValue(match.name, { emitEvent: false });
            this.loadStates(targetCountryId, stateId, stateName, cityId, cityName);
          }
        },
        error: () => {},
      });
  }

  loadStates(countryId: string, selectedStateId?: string | null, selectedStateName?: string, cityId?: string | null, cityName?: string): void {
    this.apiService.get<any[]>('/geography/states', { countryId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (states: any) => {
          const list = Array.isArray(states) ? states : (states?.data || []);
          this.rawStates.set(list);
          this.stateOptions.set(list.map((s: any) => ({ label: s.name, value: s.id })));

          let targetStateId = selectedStateId;
          if (!targetStateId && selectedStateName) {
            const found = list.find((s: any) => s.name.toLowerCase() === selectedStateName.toLowerCase());
            if (found) targetStateId = found.id;
          }

          if (targetStateId) {
            this.companyForm.controls.stateId.setValue(targetStateId, { emitEvent: false });
            const match = list.find((s: any) => s.id === targetStateId);
            if (match) this.companyForm.controls.state.setValue(match.name, { emitEvent: false });
            this.loadCities(targetStateId, cityId, cityName);
          }
        },
        error: () => {},
      });
  }

  loadCities(stateId: string, selectedCityId?: string | null, selectedCityName?: string): void {
    this.apiService.get<any[]>('/geography/cities', { stateId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cities: any) => {
          const list = Array.isArray(cities) ? cities : (cities?.data || []);
          this.rawCities.set(list);
          this.cityOptions.set(list.map((c: any) => ({ label: c.name, value: c.id })));

          let targetCityId = selectedCityId;
          if (!targetCityId && selectedCityName) {
            const found = list.find((c: any) => c.name.toLowerCase() === selectedCityName.toLowerCase());
            if (found) targetCityId = found.id;
          }

          if (targetCityId) {
            this.companyForm.controls.cityId.setValue(targetCityId, { emitEvent: false });
            const match = list.find((c: any) => c.id === targetCityId);
            if (match) this.companyForm.controls.city.setValue(match.name, { emitEvent: false });
          }
        },
        error: () => {},
      });
  }

  private hydrateFromService(s = this.settingsService.settings()): void {
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
      countryId: s.countryId || null,
      stateId: s.stateId || null,
      cityId: s.cityId || null,
      country: s.country,
      state: s.state,
      city: s.city,
    });
    this.loadCountries(s.countryId, s.country, s.stateId, s.state, s.cityId, s.city);

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
      smtpCcEmails: Array.isArray(s.smtpCcEmails) ? s.smtpCcEmails.join(', ') : (s.smtpCcEmails || ''),
      smtpBccEmails: Array.isArray(s.smtpBccEmails) ? s.smtpBccEmails.join(', ') : (s.smtpBccEmails || ''),
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
      this.uploadingLogo.update(prev => ({ ...prev, [key]: true }));

      this.mediaUploadService.uploadFile(file, 'platform', 'logos').pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: res => {
          this.uploadingLogo.update(prev => ({ ...prev, [key]: false }));
          this.logoPreviews.update(prev => ({
            ...prev,
            [key]: res.relativePath || res.url,
          }));
          this.messageService.add({
            severity: 'info',
            summary: 'Image Uploaded',
            detail: `${key} logo uploaded to media assets.`,
            life: 2500,
          });
        },
        error: err => {
          this.uploadingLogo.update(prev => ({ ...prev, [key]: false }));
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: err?.error?.message || 'Could not upload image. Please try again.',
            life: 4000,
          });
        },
      });
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
      countryId: c.countryId || null,
      stateId: c.stateId || null,
      cityId: c.cityId || null,
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
      smtpCcEmails: Array.isArray(s.smtpCcEmails) ? s.smtpCcEmails.join(', ') : String(s.smtpCcEmails || '').trim(),
      smtpBccEmails: Array.isArray(s.smtpBccEmails) ? s.smtpBccEmails.join(', ') : String(s.smtpBccEmails || '').trim(),

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
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Company settings updated successfully.',
          life: 4000,
        });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save settings. Please try again.',
          life: 4000,
        });
      },
    });
  }
}
