import { Component, inject } from '@angular/core';
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

  signupForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  get name() { return this.signupForm.get('name')!; }
  get email() { return this.signupForm.get('email')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }

  fieldClass(controlName: string, hasPaddingRight = false): string {
    const ctrl = this.signupForm.get(controlName)!;
    const base = `w-full pl-10 ${hasPaddingRight ? 'pr-10' : 'pr-4'} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2`;
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 bg-red-50 focus:ring-red-200`
      : `${base} border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white`;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { name, email, password } = this.signupForm.value as {
      name: string; email: string; password: string;
    };

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.toast.success('Account created! Redirecting to sign in…');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not create account. Please try again.'));
        this.isSubmitting = false;
      },
    });
  }
}
