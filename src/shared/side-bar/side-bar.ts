import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../environments/environment';
// import { IconName } from '../icons/icons.component';
import { IconComponent,IconName } from "../icons/icons.component";

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  private sanitizer = inject(DomSanitizer);
  protected authService = inject(AuthService);

  onNavClick(): void {
    this.closeMenu.emit();
  }

  protected avatarUrl(): string | null {
    const avatarUrl = this.authService.currentUser()?.avatarUrl;
    return avatarUrl ? `${environment.apiOrigin}${avatarUrl}` : null;
  }

  protected initials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  mainMenus: { label: string; route: string; icon: IconName }[] = [
    {
      label: 'Dashboard',
      route: '',
      icon: 'homeIcon',
    },
    {
      label: 'Transaction',
      route: '/transaction',
      icon: 'transactionIcon',
    },
    {
      label: 'Plan',
      route: '/plan',
      icon: 'planIcon',
    },
    {
      label: 'Budget',
      route: '/budget',
      icon: 'budgetIcon',
    },
  ];

  bottomMenus :{ label: string; route: string; icon: IconName }[]= [
    {
      label: 'Settings',
      route: '/settings',
      icon: 'settingsIcon'
    },
    {
      label: 'Help',
      route: '/help',
      icon:'helpIcon'
    },
  ];
}
