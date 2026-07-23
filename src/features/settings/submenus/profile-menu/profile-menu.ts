import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'profile-menu',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isUploadingAvatar = signal(false);

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.profileForm.patchValue(
          { name: user.name, email: user.email, phone: user.phone ?? '' },
          { emitEvent: false }
        );
      }
    });
  }

  get name() { return this.profileForm.get('name')!; }
  get email() { return this.profileForm.get('email')!; }
  get phone() { return this.profileForm.get('phone')!; }

  avatarUrl(): string | null {
    const avatarUrl = this.authService.currentUser()?.avatarUrl;
    return avatarUrl ? `${environment.apiOrigin}${avatarUrl}` : null;
  }

  fieldClass(controlName: string): string {
    const ctrl = this.profileForm.get(controlName)!;
    const base = 'w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2';
    return ctrl.invalid && ctrl.touched
      ? `${base} border-red-300 bg-red-50 focus:ring-red-200`
      : `${base} border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.isUploadingAvatar.set(true);
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.toast.success('Profile picture updated.');
        this.isUploadingAvatar.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not upload image. Please try again.'));
        this.isUploadingAvatar.set(false);
      },
    });
  }

  removeAvatar(): void {
    if (!this.avatarUrl()) return;

    this.isUploadingAvatar.set(true);
    this.authService.deleteAvatar().subscribe({
      next: () => {
        this.toast.success('Profile picture removed.');
        this.isUploadingAvatar.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not remove image. Please try again.'));
        this.isUploadingAvatar.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, phone } = this.profileForm.value as { name: string; email: string; phone: string };

    this.authService.updateProfile(name, email, phone || null).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully.');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not update profile. Please try again.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
