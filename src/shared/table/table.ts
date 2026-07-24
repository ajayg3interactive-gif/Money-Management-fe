import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  authService = inject(AuthService);

  @Input() columns: any;
  @Input() rows!: Record<string, any>[];
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();

  get sortedColumns() {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  getCellValue(row: Record<string, any>, key: string): any {
    return row[key] || "-";
  }
}
