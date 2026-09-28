import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { formatDdMmmYyyy } from '../utils/date-format';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-table',
  imports: [Skeleton],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  authService = inject(AuthService);

  @Input() columns: any;
  @Input() rows!: Record<string, any>[];
  /** Shows skeleton placeholder rows instead of data/empty-state while the rows are still loading. */
  @Input() isLoading = false;
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();

  readonly skeletonRows = Array.from({ length: 5 });

  get sortedColumns() {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  getCellValue(row: Record<string, any>, key: string): any {
    if (key === 'date' && row[key]) {
      return formatDdMmmYyyy(row[key]);
    }
    return row[key] || "-";
  }
}
