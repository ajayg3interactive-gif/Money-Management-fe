import { Component, EventEmitter, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { formatDdMmmYyyy } from '../utils/date-format';
import { Skeleton } from '../skeleton/skeleton';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-table',
  imports: [Skeleton],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table implements OnChanges {
  authService = inject(AuthService);

  @Input() columns: any;
  @Input() rows!: Record<string, any>[];
  /** Shows skeleton placeholder rows instead of data/empty-state while the rows are still loading. */
  @Input() isLoading = false;
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();

  readonly pageSize = PAGE_SIZE;
  readonly skeletonRows = Array.from({ length: 5 });
  currentPage = signal(1);

  ngOnChanges() {
    const maxPage = Math.max(1, Math.ceil((this.rows?.length ?? 0) / this.pageSize));
    if (this.currentPage() > maxPage) {
      this.currentPage.set(maxPage);
    }
  }

  get sortedColumns() {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.rows?.length ?? 0) / this.pageSize));
  }

  get pagedRows(): Record<string, any>[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return (this.rows ?? []).slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage.set(page);
  }

  getCellValue(row: Record<string, any>, key: string): any {
    if (key === 'date' && row[key]) {
      return formatDdMmmYyyy(row[key]);
    }
    return row[key] || "-";
  }
}
