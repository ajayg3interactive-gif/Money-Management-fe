import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-year-month-filter',
  templateUrl: './year-month-filter.html',
  styleUrl: './year-month-filter.css',
})
export class YearMonthFilter {
  @Input() years: number[] = [];
  @Input() selectedYear: number | null = null;
  @Input() selectedMonth: number | null = null;
  @Input() allowAllYears = true;
  @Input() allowAllMonths = true;

  @Output() yearChange = new EventEmitter<number | null>();
  @Output() monthChange = new EventEmitter<number | null>();

  open = signal(false);
  yearOpen = signal(false);
  monthOpen = signal(false);

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  toggleOpen() {
    this.open.set(!this.open());
    this.yearOpen.set(false);
    this.monthOpen.set(false);
  }

  closeDropdown() {
    this.open.set(false);
    this.yearOpen.set(false);
    this.monthOpen.set(false);
  }

  isActive(): boolean {
    return this.selectedYear !== null || this.selectedMonth !== null;
  }

  toggleYearOpen() {
    this.yearOpen.set(!this.yearOpen());
    this.monthOpen.set(false);
  }

  toggleMonthOpen() {
    this.monthOpen.set(!this.monthOpen());
    this.yearOpen.set(false);
  }

  monthLabel(value: number): string {
    return this.months.find(m => m.value === value)?.label ?? '';
  }

  selectYear(year: number | null) {
    this.yearChange.emit(year);
    this.yearOpen.set(false);
  }

  selectMonth(month: number | null) {
    this.monthChange.emit(month);
    this.monthOpen.set(false);
  }

  clear() {
    this.yearChange.emit(null);
    this.monthChange.emit(null);
    this.closeDropdown();
  }
}
