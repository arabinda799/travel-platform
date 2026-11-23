import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, TextFieldComponent, AuthService } from 'admin-core';

function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (confirm && pw !== confirm) return { mismatch: true };
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, TextFieldComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);

  readonly form = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required, Validators.maxLength(80)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(80)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: matchPasswords },
  );

  fieldError(name: string): string {
    const ctrl = this.form.get(name);
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return `${this.fieldLabel(name)} is required`;
    if (ctrl.hasError('email')) return 'Enter a valid email address';
    if (ctrl.hasError('minlength')) return 'Password must be at least 8 characters';
    if (ctrl.hasError('pattern')) return 'Password needs uppercase, lowercase, and a number';
    if (name === 'confirmPassword' && this.form.hasError('mismatch') && ctrl.dirty) return 'Passwords do not match';
    return '';
  }

  private fieldLabel(name: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };
    return labels[name] ?? name;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    // Mock registration — replace with real API call
    setTimeout(() => {
      this.authService.login({
        id: `usr-${Date.now()}`,
        name: `${v.firstName} ${v.lastName}`.trim(),
        email: v.email!,
        role: 'platform_admin',
      });
      this.router.navigate(['/dashboard']);
    }, 800);
  }
}
