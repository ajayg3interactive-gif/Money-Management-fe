import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { IconComponent } from "../../../shared/icons/icons.component";

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password-confirm',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './reset-password-confirm.html',
})
export class ResetPasswordConfirm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  form: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: passwordsMatchValidator }
  );

  isSubmitting = signal(false);
  tokenMissing = signal(!this.token);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  get newPassword() { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  fieldClass(controlName: string): string {
    const ctrl = this.form.get(controlName)!;
    const base = 'w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2';
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 focus:ring-red-200 text-text`
      : `${base} border-border focus:border-primary focus:ring-primary/20 bg-surface text-text`;
  }

  toggleNewPassword(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.form.invalid || this.tokenMissing()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { newPassword, confirmPassword } = this.form.value as { newPassword: string; confirmPassword: string };

    this.authService.confirmResetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: () => {
        this.toast.success('Password updated. Please log in again.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not update password. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
