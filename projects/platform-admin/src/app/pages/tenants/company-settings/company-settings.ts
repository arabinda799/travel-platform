import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  ButtonComponent,
  TextFieldComponent,
  SwitchFieldComponent,
} from 'admin-core';
import { TenantCompany, TenantBranding, TenantSmtp, CompanyService } from '../company-list/company.service';

export type WhitelabelTab = 'overview' | 'web' | 'app' | 'contact' | 'social' | 'smtp';

interface TabItem { key: WhitelabelTab; label: string; icon: string; }

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: 'info' },
  { key: 'web', label: 'Web Branding', icon: 'web' },
  { key: 'app', label: 'App Branding', icon: 'phone_android' },
  { key: 'contact', label: 'Contact & Footer', icon: 'support_agent' },
  { key: 'social', label: 'Social & SEO', icon: 'share' },
  { key: 'smtp', label: 'SMTP', icon: 'mail' },
];

@Component({
  selector: 'app-tenant-company-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    TextFieldComponent,
    SwitchFieldComponent,
  ],
  templateUrl: './company-settings.html',
  styleUrl: './company-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantCompanySettingsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly companyId = signal<string>('');
  readonly company = computed<TenantCompany | null>(() =>
    this.companyService.companies().find(c => c.id === this.companyId()) ?? null,
  );

  readonly activeTab = signal<WhitelabelTab>('overview');
  readonly tabs = TABS;
  readonly saving = signal<boolean>(false);

  // Web branding form
  readonly webForm = new FormGroup({
    logoDark: new FormControl(''),
    logoLight: new FormControl(''),
    favicon: new FormControl(''),
    loginBg: new FormControl(''),
    primary: new FormControl(''),
    secondary: new FormControl(''),
    accent: new FormControl(''),
    background: new FormControl(''),
    backgroundSecondary: new FormControl(''),
    text: new FormControl(''),
  });

  // App branding form
  readonly appForm = new FormGroup({
    logoDark: new FormControl(''),
    logoLight: new FormControl(''),
    splash: new FormControl(''),
    primary: new FormControl(''),
    secondary: new FormControl(''),
    accent: new FormControl(''),
    background: new FormControl(''),
    backgroundSecondary: new FormControl(''),
    text: new FormControl(''),
  });

  // Contact & Footer form
  readonly contactForm = new FormGroup({
    footer: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    whatsapp: new FormControl(''),
    tollfree: new FormControl(''),
  });

  // Social & SEO form
  readonly socialForm = new FormGroup({
    facebook: new FormControl(''),
    twitter: new FormControl(''),
    instagram: new FormControl(''),
    linkedin: new FormControl(''),
    youtube: new FormControl(''),
    metaTitle: new FormControl(''),
    metaKeywords: new FormControl(''),
    metaDescription: new FormControl(''),
    robots: new FormControl(''),
  });

  // SMTP form
  readonly smtpForm = new FormGroup({
    host: new FormControl(''),
    port: new FormControl<number>(465),
    username: new FormControl(''),
    password: new FormControl(''),
    secure: new FormControl<boolean>(true),
    fromEmail: new FormControl(''),
    fromName: new FormControl(''),
    replyToEmail: new FormControl(''),
  });

  readonly breadcrumbs = computed(() => {
    const c = this.company();
    return [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Tenant Management' },
      { label: 'Companies', route: '/tenants/companies' },
      { label: c ? c.companyName : 'Settings' },
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.companyId.set(id);
      const company = this.companyService.companies().find(c => c.id === id);
      if (company) this._patchForms(company);
    }
  }

  private _patchForms(company: TenantCompany): void {
    const b = company.branding;
    this.webForm.patchValue({
      logoDark: b.web.logos.dark ?? '', logoLight: b.web.logos.light ?? '',
      favicon: b.web.logos.favicon ?? '', loginBg: b.web.logos.loginBg ?? '',
      primary: b.web.colors.primary, secondary: b.web.colors.secondary,
      accent: b.web.colors.accent, background: b.web.colors.background,
      backgroundSecondary: b.web.colors.backgroundSecondary, text: b.web.colors.text,
    });
    this.appForm.patchValue({
      logoDark: b.app.logos.dark ?? '', logoLight: b.app.logos.light ?? '',
      splash: b.app.logos.splash ?? '',
      primary: b.app.colors.primary, secondary: b.app.colors.secondary,
      accent: b.app.colors.accent, background: b.app.colors.background,
      backgroundSecondary: b.app.colors.backgroundSecondary, text: b.app.colors.text,
    });
    this.contactForm.patchValue({
      footer: b.text.footer, email: b.support.email, phone: b.support.phone,
      whatsapp: b.support.whatsapp, tollfree: b.support.tollfree,
    });
    this.socialForm.patchValue({
      facebook: b.social.facebook ?? '', twitter: b.social.twitter ?? '',
      instagram: b.social.instagram ?? '', linkedin: b.social.linkedin ?? '',
      youtube: b.social.youtube ?? '',
      metaTitle: b.meta.title, metaKeywords: b.meta.keywords,
      metaDescription: b.meta.description, robots: b.meta.robots,
    });
    const s = company.smtp;
    this.smtpForm.patchValue({
      host: s.host, port: s.port, username: s.username, password: s.password,
      secure: s.secure, fromEmail: s.fromEmail, fromName: s.fromName, replyToEmail: s.replyToEmail,
    });
  }

  setTab(tab: WhitelabelTab): void { this.activeTab.set(tab); }

  save(): void {
    const company = this.company();
    if (!company) return;
    this.saving.set(true);

    const wv = this.webForm.getRawValue();
    const av = this.appForm.getRawValue();
    const cv = this.contactForm.getRawValue();
    const sv = this.socialForm.getRawValue();
    const smv = this.smtpForm.getRawValue();

    const branding: TenantBranding = {
      web: {
        logos: { dark: wv.logoDark || null, light: wv.logoLight || null, favicon: wv.favicon || null, loginBg: wv.loginBg || null },
        colors: { primary: wv.primary ?? '#8323A1', secondary: wv.secondary ?? '#F56822', accent: wv.accent ?? '#D03D4E', background: wv.background ?? '#F8F9FA', backgroundSecondary: wv.backgroundSecondary ?? '#FFFFFF', text: wv.text ?? '#212529' },
      },
      app: {
        logos: { dark: av.logoDark || null, light: av.logoLight || null, splash: av.splash || null },
        colors: { primary: av.primary ?? '#8323A1', secondary: av.secondary ?? '#F56822', accent: av.accent ?? '#D03D4E', background: av.background ?? '#F8F9FA', backgroundSecondary: av.backgroundSecondary ?? '#FFFFFF', text: av.text ?? '#212529' },
      },
      text: { footer: cv.footer ?? '' },
      support: { email: cv.email ?? '', phone: cv.phone ?? '', whatsapp: cv.whatsapp ?? '', tollfree: cv.tollfree ?? '' },
      social: { facebook: sv.facebook || null, twitter: sv.twitter || null, instagram: sv.instagram || null, linkedin: sv.linkedin || null, youtube: sv.youtube || null },
      meta: { title: sv.metaTitle ?? '', keywords: sv.metaKeywords ?? '', description: sv.metaDescription ?? '', robots: sv.robots ?? 'index, follow' },
    };

    const smtp: TenantSmtp = {
      host: smv.host ?? '', port: smv.port ?? 465, username: smv.username ?? '',
      password: smv.password ?? '', secure: smv.secure ?? true,
      fromEmail: smv.fromEmail ?? '', fromName: smv.fromName ?? '', replyToEmail: smv.replyToEmail ?? '',
    };

    forkJoin([
      this.companyService.updateBranding(company.id, branding),
      this.companyService.updateSmtp(company.id, smtp),
    ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: `${company.companyName} settings updated.` });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save settings.' });
      },
    });
  }

  goBack(): void { this.router.navigate(['/tenants/companies']); }
}
