import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, ButtonComponent, TextFieldComponent } from 'admin-core';

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const pw = parent.get('newPassword')?.value;
  return control.value && control.value !== pw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, TextFieldComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly showNewPw = signal(false);
  readonly showConfirmPw = signal(false);

  readonly form = new FormGroup({
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ]),
    confirmPassword: new FormControl('', [Validators.required, confirmPasswordValidator]),
  });

  constructor() {
    this.form.controls.newPassword.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.confirmPassword.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const token = this.route.snapshot.queryParamMap.get('token') || this.route.snapshot.queryParamMap.get('otp');
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!token) {
      this.errorMessage.set('Invalid or missing reset token.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.api.post<{ message: string }>('/tenant/auth/reset-password', {
      email,
      otp: token,
      newPassword: this.form.value.newPassword,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.loading.set(false); this.submitted.set(true); },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message ?? 'Invalid or expired reset link. Please request a new one.');
        },
      });
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }
}
