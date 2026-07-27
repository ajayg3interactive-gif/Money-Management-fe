import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { IconComponent } from "../../../shared/icons/icons.component";

function emailsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newEmail = group.get('newEmail')?.value;
  const confirmEmail = group.get('confirmEmail')?.value;
  return newEmail && confirmEmail && newEmail !== confirmEmail ? { emailMismatch: true } : null;
}

@Component({
  selector: 'app-change-email-confirm',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './change-email-confirm.html',
})
export class ChangeEmailConfirm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  form: FormGroup = this.fb.group(
    {
      newEmail: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
    },
    { validators: emailsMatchValidator }
  );

  isSubmitting = signal(false);
  tokenMissing = signal(!this.token);

  get newEmail() { return this.form.get('newEmail')!; }
  get confirmEmail() { return this.form.get('confirmEmail')!; }

  fieldClass(controlName: string): string {
    const ctrl = this.form.get(controlName)!;
    const base = 'w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2';
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 focus:ring-red-200 text-text`
      : `${base} border-border focus:border-primary focus:ring-primary/20 bg-surface text-text`;
  }

  onSubmit(): void {
    if (this.form.invalid || this.tokenMissing()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { newEmail, confirmEmail } = this.form.value as { newEmail: string; confirmEmail: string };

    this.authService.confirmChangeEmail(this.token, newEmail, confirmEmail).subscribe({
      next: () => {
        this.toast.success('Email updated. Please log in again.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not update email. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
