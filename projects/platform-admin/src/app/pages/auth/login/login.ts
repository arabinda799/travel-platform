import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, TextFieldComponent, CheckboxFieldComponent, AuthService, ApiService } from 'admin-core';

interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; role: 'super_admin' | 'platform_admin' | 'tenant_admin' | 'operator' };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, TextFieldComponent, CheckboxFieldComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  get emailError(): string {
    const ctrl = this.form.controls.email;
    if (!ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Email is required';
    if (ctrl.hasError('email')) return 'Enter a valid email address';
    return '';
  }

  get passwordError(): string {
    const ctrl = this.form.controls.password;
    if (!ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Password is required';
    if (ctrl.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password, rememberMe } = this.form.getRawValue();

    this.api.post<any>('/platform/auth/login', { email, password }).subscribe({
      next: (res) => {
        const user = {
          id: res.user.id,
          name: `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim() || res.user.email,
          email: res.user.email,
          role: 'platform_admin' as const,
          refreshToken: res.refreshToken,
        };
        this.authService.login(user, res.accessToken, rememberMe ?? false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Invalid email or password. Please try again.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : msg);
        this.loading.set(false);
      },
    });
  }
}
