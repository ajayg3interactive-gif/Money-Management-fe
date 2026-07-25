import { Component } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { FeedbackMenu } from './submenus/feedback-menu/feedback-menu';
import { TutorialMenu } from './submenus/tutorial-menu/tutorial-menu';
import { IconComponent, IconName } from '../../shared/icons/icons.component';

@Component({
  selector: 'app-help',
  imports: [NgComponentOutlet, IconComponent],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  activeSubMenu: string = 'Feedback';
  activeCom: any = FeedbackMenu;

  subMenus: { label: string; icon: IconName; component: any }[] = [
    {
      label: 'Feedback',
      icon: 'mail',
      component: FeedbackMenu,
    },
    {
      label: 'Tutorial',
      icon: 'tutorialIcon',
      component: TutorialMenu,
    },
  ];

  handleSubmenu(menu: any) {
    this.activeSubMenu = menu.label;
    this.activeCom = menu.component;
  }
}
