import { Component, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { IconComponent } from "../../../shared/icons/icons.component";

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type SignupStep = 'details' | 'otp' | 'password';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './signup.html',
})
export class Signup {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  detailsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  step = signal<SignupStep>('details');
  otpDigits = signal<string[]>(Array(OTP_LENGTH).fill(''));
  otpError = signal('');

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  sendingOtp = signal(false);
  verifyingOtp = signal(false);
  resendingOtp = signal(false);
  resendCooldown = signal(0);
  isSubmitting = signal(false);

  private resendTimer?: ReturnType<typeof setInterval>;

  get name() { return this.detailsForm.get('name')!; }
  get email() { return this.detailsForm.get('email')!; }
  get password() { return this.passwordForm.get('password')!; }
  get confirmPassword() { return this.passwordForm.get('confirmPassword')!; }

  get otpCode(): string {
    return this.otpDigits().join('');
  }

  fieldClass(form: FormGroup, controlName: string, hasPaddingRight = false): string {
    const ctrl = form.get(controlName)!;
    const base = `w-full pl-10 ${hasPaddingRight ? 'pr-10' : 'pr-4'} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2`;
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 focus:ring-red-200 text-text`
      : `${base} border-border focus:border-primary focus:ring-primary/20 bg-surface text-text`;
  }

  sendOtp(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    this.sendingOtp.set(true);
    const { name, email } = this.detailsForm.value as { name: string; email: string };

    this.authService.sendOtp(name, email).subscribe({
      next: () => {
        this.sendingOtp.set(false);
        this.email.disable();
        this.step.set('otp');
        this.otpDigits.set(Array(OTP_LENGTH).fill(''));
        this.otpError.set('');
        this.toast.success('OTP sent to your email.');
        this.startResendCooldown();
      },
      error: (err) => {
        this.sendingOtp.set(false);
        this.toast.error(extractErrorMessage(err, 'Could not send OTP. Please try again.'));
      },
    });
  }

  changeEmail(): void {
    this.stopResendCooldown();
    this.email.enable();
    this.step.set('details');
    this.otpDigits.set(Array(OTP_LENGTH).fill(''));
    this.otpError.set('');
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    this.otpDigits.update(digits => {
      const next = [...digits];
      next[index] = digit;
      return next;
    });
    input.value = digit;

    if (digit && index < OTP_LENGTH - 1) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (!digits.length) return;

    event.preventDefault();
    this.otpDigits.update(current => {
      const next = [...current];
      digits.forEach((digit, i) => (next[i] = digit));
      return next;
    });

    const inputs = this.otpInputs.toArray();
    digits.forEach((digit, i) => (inputs[i].nativeElement.value = digit));
    inputs[Math.min(digits.length, OTP_LENGTH) - 1]?.nativeElement.focus();
  }

  verifyOtp(): void {
    this.otpError.set('');
    if (this.otpCode.length !== OTP_LENGTH) {
      this.otpError.set('Enter the 6-digit code.');
      return;
    }

    this.verifyingOtp.set(true);
    this.authService.verifyOtp(this.email.value, this.otpCode).subscribe({
      next: () => {
        this.verifyingOtp.set(false);
        this.stopResendCooldown();
        this.step.set('password');
        this.toast.success('Email verified successfully.');
      },
      error: (err) => {
        this.verifyingOtp.set(false);
        this.otpError.set(extractErrorMessage(err, 'Invalid or expired OTP.'));
      },
    });
  }

  resendOtp(): void {
    if (this.resendCooldown() > 0 || this.resendingOtp()) return;

    this.resendingOtp.set(true);
    const { name } = this.detailsForm.getRawValue() as { name: string };

    this.authService.sendOtp(name, this.email.value).subscribe({
      next: () => {
        this.resendingOtp.set(false);
        this.otpDigits.set(Array(OTP_LENGTH).fill(''));
        this.otpError.set('');
        this.toast.success('OTP resent to your email.');
        this.startResendCooldown();
      },
      error: (err) => {
        this.resendingOtp.set(false);
        this.toast.error(extractErrorMessage(err, 'Could not resend OTP. Please try again.'));
      },
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name } = this.detailsForm.getRawValue() as { name: string };
    const { password } = this.passwordForm.value as { password: string };

    this.authService.register(name, this.email.value, password).subscribe({
      next: () => {
        this.toast.success('Account created! Redirecting to sign in…');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not create account. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }

  private startResendCooldown(): void {
    this.stopResendCooldown();
    this.resendCooldown.set(RESEND_COOLDOWN_SECONDS);
    this.resendTimer = setInterval(() => {
      this.resendCooldown.update(seconds => seconds - 1);
      if (this.resendCooldown() <= 0) {
        this.stopResendCooldown();
      }
    }, 1000);
  }

  private stopResendCooldown(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = undefined;
    }
    this.resendCooldown.set(0);
  }
}
