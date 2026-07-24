import { Injectable } from '@angular/core';
import { Config, driver } from 'driver.js';
import { TOURS } from './tours/tours.registry';

@Injectable({ providedIn: 'root' })
export class ProductTourService {
  private readonly storagePrefix = 'product-tour-seen-';

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

    const tourDriver = driver({
      showProgress: false,
      popoverClass: 'driverjs-theme',
      showButtons:["next","previous"],
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
        options?.onDestroyed?.(...args);
      },
    });

    tourDriver.drive();
  }
}
