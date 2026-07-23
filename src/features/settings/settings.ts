import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProfileMenu } from "./submenus/profile-menu/profile-menu";
import { NgComponentOutlet } from '@angular/common';
import { CurrentBalanceMenu } from './submenus/current-balance-menu/current-balance-menu';
import { SecurityMenu } from './submenus/security-menu/security-menu';

@Component({
  selector: 'app-settings',
  imports: [ProfileMenu, NgComponentOutlet],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private sanitizer = inject(DomSanitizer);

  activeSubMenu: string = 'Profile';
  activeCom: any = ProfileMenu;

  private icon(paths: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
    );
  }


  subMenus = [
    {
      label: 'Profile',
      icon: this.icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user-round-icon lucide-circle-user-round"><path d="M17.925 20.056a6 6 0 0 0-11.851.001"/><circle cx="12" cy="11" r="4"/><circle cx="12" cy="12" r="10"/></svg>'
      ),
      component: ProfileMenu
    },
    {
      label: 'Current Balance',
      icon: this.icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dollar-sign-icon lucide-circle-dollar-sign"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>'
      ),
      component: CurrentBalanceMenu
    },
    {
      label: 'Security',
      // route: '/budget',
      icon: this.icon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fingerprint-pattern-icon lucide-fingerprint-pattern"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>'
      ),
      component: SecurityMenu
    },
  ];


  handleSubmenu(menu: any) {
    this.activeSubMenu = menu.label;
    this.activeCom = menu.component;
  }

}
