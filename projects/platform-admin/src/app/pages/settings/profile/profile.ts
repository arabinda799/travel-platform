import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  BreadcrumbItem,
  ButtonComponent,
  TextFieldComponent,
  SelectFieldComponent,
  FormModalComponent,
} from 'admin-core';

export interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  timezone: string;
  twoFactorEnabled: boolean;
  avatarUrl: string;
  lastLoginAt: string;
  lastLoginIp: string;
  createdAt: string;
}

const STORAGE_KEY = 'platform_admin_profile';

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const newPw = parent.get('newPassword')?.value;
  return control.value && control.value !== newPw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    TextFieldComponent,
    SelectFieldComponent,
    FormModalComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Settings', route: '/system/settings/company' },
    { label: 'Profile' },
  ];

  readonly profile = signal<AdminProfile>(this.loadProfile());
  readonly saving = signal(false);
  readonly changePasswordVisible = signal(false);
  readonly showCurrentPw = signal(false);
  readonly showNewPw = signal(false);
  readonly showConfirmPw = signal(false);
  readonly pwStrength = signal(0);

  readonly timezoneOptions = [
    { label: 'Asia/Kolkata (IST, +5:30)', value: 'Asia/Kolkata' },
    { label: 'Asia/Dubai (GST, +4:00)', value: 'Asia/Dubai' },
    { label: 'Asia/Singapore (SGT, +8:00)', value: 'Asia/Singapore' },
    { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
    { label: 'America/New_York (ET)', value: 'America/New_York' },
    { label: 'America/Los_Angeles (PT)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' },
  ];

  readonly profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(80)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(80)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.maxLength(20)),
    timezone: new FormControl('Asia/Kolkata', Validators.required),
  });

  readonly changePasswordForm = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ]),
    confirmPassword: new FormControl('', [Validators.required, confirmPasswordValidator]),
  });

  readonly displayName = computed(() => {
    const p = this.profile();
    return `${p.firstName} ${p.lastName}`.trim() || p.email;
  });

  readonly avatarInitials = computed(() => {
    const p = this.profile();
    const f = p.firstName?.[0] ?? '';
    const l = p.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || p.email[0]?.toUpperCase() || 'A';
  });

  readonly pwStrengthLabel = computed(() => {
    const s = this.pwStrength();
    if (s === 0) return '';
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  });

  readonly pwStrengthClass = computed(() => {
    const s = this.pwStrength();
    if (s <= 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  });

  constructor() {
    const p = this.profile();
    this.profileForm.patchValue({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
      timezone: p.timezone,
    });

    this.changePasswordForm.controls.newPassword.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.updatePwStrength(val ?? '');
      this.changePasswordForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  private loadProfile(): AdminProfile {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AdminProfile;
    } catch { /* ignore */ }
    const initial: AdminProfile = {
      firstName: 'Arabinda',
      lastName: 'Jena',
      email: 'arabinda.jena@finqy.ai',
      phone: '+91 98765 43210',
      role: 'Super Admin',
      department: 'Platform Engineering',
      timezone: 'Asia/Kolkata',
      twoFactorEnabled: false,
      avatarUrl: '',
      lastLoginAt: '19 Nov 2026 / 09:45 AM',
      lastLoginIp: '103.145.72.11',
      createdAt: '01 Jan 2026 / 10:00 AM',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  private updatePwStrength(pw: string): void {
    if (!pw) { this.pwStrength.set(0); return; }
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    this.pwStrength.set(score);
  }

  onSaveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }
    this.saving.set(true);
    const v = this.profileForm.getRawValue();
    const updated: AdminProfile = {
      ...this.profile(),
      firstName: v.firstName!.trim(),
      lastName: v.lastName!.trim(),
      email: v.email!.trim(),
      phone: (v.phone ?? '').trim(),
      timezone: v.timezone!,
    };
    this.profile.set(updated);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    setTimeout(() => {
      this.saving.set(false);
      this.messageService.add({ severity: 'success', summary: 'Profile Updated', detail: 'Your profile changes have been saved.' });
    }, 300);
  }

  openChangePassword(): void {
    this.changePasswordForm.reset();
    this.pwStrength.set(0);
    this.showCurrentPw.set(false);
    this.showNewPw.set(false);
    this.showConfirmPw.set(false);
    this.changePasswordVisible.set(true);
  }

  onChangePassword(): void {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fix the errors before submitting.' });
      return;
    }
    const { currentPassword, newPassword } = this.changePasswordForm.getRawValue();
    if (currentPassword === newPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Same Password', detail: 'New password must differ from the current one.' });
      return;
    }
    // In production: call auth API to change password
    this.changePasswordVisible.set(false);
    this.messageService.add({ severity: 'success', summary: 'Password Changed', detail: 'Your password has been updated successfully.' });
  }

  onAvatarUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      const updated = { ...this.profile(), avatarUrl: url };
      this.profile.set(updated);
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
  }
}
