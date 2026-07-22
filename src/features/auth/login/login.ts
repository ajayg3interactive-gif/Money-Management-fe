import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  message: { type: 'success' | 'error'; text: string } | null = null;
  showPassword = false;
  isSubmitting = false;

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  fieldClass(controlName: string, hasPaddingRight = false): string {
    const ctrl = this.loginForm.get(controlName)!;
    const base = `w-full pl-10 ${hasPaddingRight ? 'pr-10' : 'pr-4'} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2`;
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 bg-red-50 focus:ring-red-200`
      : `${base} border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white`;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = null;

    const { email, password } = this.loginForm.value as { email: string; password: string };

    this.authService.login(email, password).subscribe({
      next: () => {
        this.message = { type: 'success', text: 'Login successful! Redirecting…' };
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        setTimeout(() => this.router.navigateByUrl(returnUrl ?? '/'), 800);
      },
      error: (err) => {
        this.message = {
          type: 'error',
          text: err?.error?.error ?? 'Invalid email or password. Please try again.',
        };
        this.isSubmitting = false;
      },
    });
  }
}
