import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductTourService } from '../../../../shared/product-tour/product-tour.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IconComponent, IconName } from '../../../../shared/icons/icons.component';

interface TutorialItem {
  label: string;
  description: string;
  icon: IconName;
  tourId: string;
  route: string;
}

@Component({
  selector: 'tutorial-menu',
  imports: [IconComponent],
  templateUrl: './tutorial-menu.html',
  styleUrl: './tutorial-menu.css',
})
export class TutorialMenu {
  private router = inject(Router);
  private productTourService = inject(ProductTourService);
  private authService = inject(AuthService);

  tutorials: TutorialItem[] = [
    {
      label: 'Dashboard',
      description: 'Learn how to add transactions and budgets right from the dashboard.',
      icon: 'homeIcon',
      tourId: 'dashboard-onboarding',
      route: '/',
    },
    {
      label: 'Plan',
      description: 'See how to schedule, hold, and manage your recurring auto transactions.',
      icon: 'planIcon',
      tourId: 'plan-onboarding',
      route: '/plan',
    },
  ];

  startTutorial(item: TutorialItem): void {
    this.productTourService.resetTour(item.tourId);
    // Clear the "seen" flag on the account too - dashboard/plan gate their auto-start on
    // it, so without this the replay would silently no-op for anyone who already completed it.
    this.authService.markTourSeen(item.tourId, false).subscribe({
      next: () => this.router.navigateByUrl(item.route),
      error: () => this.router.navigateByUrl(item.route),
    });
  }
}
