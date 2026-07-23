import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProfileMenu } from "./submenus/profile-menu/profile-menu";
import { NgComponentOutlet } from '@angular/common';
import { CurrentBalanceMenu } from './submenus/current-balance-menu/current-balance-menu';
import { SecurityMenu } from './submenus/security-menu/security-menu';
import { IconComponent, IconName } from "../../icons.component";

@Component({
  selector: 'app-settings',
  imports: [ProfileMenu, NgComponentOutlet, IconComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private sanitizer = inject(DomSanitizer);

  activeSubMenu: string = 'Profile';
  activeCom: any = ProfileMenu;

  subMenus :{ label: string; icon: IconName; component: any }[]= [
    {
      label: 'Profile',
      icon: 'profile',
      component: ProfileMenu
    },
    {
      label: 'Current Balance',
      icon: 'dollarCircle',
      component: CurrentBalanceMenu
    },
    {
      label: 'Security',
      // route: '/budget',
      icon:'fingerprint',
      component: SecurityMenu
    },
  ];


  handleSubmenu(menu: any) {
    this.activeSubMenu = menu.label;
    this.activeCom = menu.component;
  }

}
