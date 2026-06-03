import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {

  @Input() columns:any;

//  columns = [
//     { position: 1, key: 'date',        label: 'Date',        view: true },
//     { position: 2, key: 'description', label: 'Description', view: true },
//     { position: 3, key: 'category',    label: 'Category',    view: true },
//     { position: 5, key: 'amount',      label: 'Amount',      view: true },
//     { position: 4, key: 'action',      label: 'Action',      view: true },
//   ];

@Input() rows!: Record<string, any>[];


  get sortedColumns() {
    return [...this.columns].sort((a, b) => a.position - b.position);
  }

  getCellValue(row: Record<string, any>, key: string): any {
  return row[key];
}
}
