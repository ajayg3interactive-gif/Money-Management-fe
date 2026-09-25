import { Directive, HostListener } from '@angular/core';

/**
 * Prevents the mouse/trackpad scroll wheel from changing the value of a
 * focused `<input type="number">`. Browsers apply the wheel delta to a
 * focused number input by default, which surprises users while scrolling
 * the page. Blurring the input on wheel stops that without blocking page
 * scroll.
 */
@Directive({
  selector: 'input[type="number"][noScrollNumber]',
  standalone: true,
})
export class NoScrollNumberDirective {
  @HostListener('wheel', ['$event.target'])
  onWheel(target: EventTarget | null) {
    (target as HTMLInputElement | null)?.blur();
  }
}
