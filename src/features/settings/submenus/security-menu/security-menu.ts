import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error';
import { IconComponent } from "../../../../shared/icons/icons.component";

@Component({
  selector: 'security-menu',
  imports: [IconComponent],
  templateUrl: './security-menu.html',
  styleUrl: './security-menu.css',
})
export class SecurityMenu {
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isSendingEmailLink = signal(false);
  isSendingPasswordLink = signal(false);

  currentEmail(): string {
    return this.authService.currentUser()?.email ?? '';
  }

  requestChangeEmail(): void {
    this.isSendingEmailLink.set(true);
    this.authService.requestChangeEmail().subscribe({
      next: () => {
        this.toast.success('Check your inbox for a link to confirm your new email.');
        this.isSendingEmailLink.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not send confirmation email. Please try again.'));
        this.isSendingEmailLink.set(false);
      },
    });
  }

  requestChangePassword(): void {
    this.isSendingPasswordLink.set(true);
    this.authService.requestChangePassword().subscribe({
      next: () => {
        this.toast.success('Check your inbox for a link to reset your password.');
        this.isSendingPasswordLink.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not send reset email. Please try again.'));
        this.isSendingPasswordLink.set(false);
      },
    });
  }
}
