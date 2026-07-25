import { Injectable, inject } from '@angular/core';
import { Config, Driver, driver } from 'driver.js';
import { NavigationStart, Router } from '@angular/router';
import { TOURS } from './tours/tours.registry';

@Injectable({ providedIn: 'root' })
export class ProductTourService {
  private readonly storagePrefix = 'product-tour-seen-';
  private router = inject(Router);
  private activeDriver: Driver | null = null;

  constructor() {
    // Popovers are appended to document.body, outside Angular's view tree, so a route
    // change wouldn't otherwise tear one down - close it out before the next page renders.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.activeDriver?.destroy();
      }
    });
  }

  hasSeenTour(tourId: string): boolean {
    return !!localStorage.getItem(this.storagePrefix + tourId);
  }

  markTourSeen(tourId: string): void {
    localStorage.setItem(this.storagePrefix + tourId, 'true');
  }

  resetTour(tourId: string): void {
    localStorage.removeItem(this.storagePrefix + tourId);
  }

  startTour(tourId: string, options?: Partial<Config>): void {
    if (this.hasSeenTour(tourId)) {
      return;
    }

    const steps = TOURS[tourId];
    if (!steps) {
      console.warn(`ProductTourService: no tour registered for id "${tourId}"`);
      return;
    }

    // Only one tour's popover should ever be on screen at a time.
    this.activeDriver?.destroy();

    const tourDriver = driver({
      showProgress: false,
      popoverClass: 'driverjs-theme',
      showButtons:["next","previous"],
      // On a fresh page load the target element may not have rendered yet (e.g. it comes
      // from a signal/computed that resolves after this tick) - wait for it instead of
      // silently failing to highlight anything.
      waitForElement: 1500,
      ...options,
      steps,
      // onPopoverRender(popover, { config, state }) {
      //   const skipButton = document.createElement("button");
      //   skipButton.className = "driver-popover-footer-skip-btn";
      //   skipButton.innerText = "Skip"
      //   // skipButton.classList.add("driver-popover-footer-btn");
      //   popover.footerButtons.before(skipButton);

      //   skipButton.addEventListener("click", () => {
      //     tourDriver.destroy();
      //   });

      // },
      onDestroyed: (...args) => {
        this.markTourSeen(tourId);
        this.activeDriver = null;
        options?.onDestroyed?.(...args);
      },
    });

    this.activeDriver = tourDriver;
    tourDriver.drive();
  }
}
