import { Component, Input } from '@angular/core';

/**
 * Generic shimmer placeholder block. Size it with [width]/[height]/[rounded]
 * to approximate the real content it stands in for, so swapping it out for
 * the loaded data doesn't shift the layout.
 */
@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() rounded = '8px';
}
