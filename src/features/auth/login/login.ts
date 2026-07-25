import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { IconComponent } from "../../../shared/icons/icons.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = signal(false);
  isSubmitting = signal(false);

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  fieldClass(controlName: string, hasPaddingRight = false): string {
    const ctrl = this.loginForm.get(controlName)!;
    const base = `w-full pl-10 ${hasPaddingRight ? 'pr-10' : 'pr-4'} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2`;
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 bg-red-50 focus:ring-red-200 text-text`
      : `${base} border-border focus:border-primary focus:ring-primary/20 bg-surface text-text`;
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login(email, password).subscribe({
      next: () => {
        this.toast.success('Login successful! Redirecting…');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl ?? '/');
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Invalid email or password. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
