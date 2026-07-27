import { Component, ElementRef, EventEmitter, Input, Output, signal } from '@angular/core';

interface DayCell {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker {
  @Input() value = '';
  @Input() placeholder = 'Select date';

  @Output() valueChange = new EventEmitter<string>();

  readonly weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  private readonly panelHeight = 340;

  open = signal(false);
  openUpward = signal(false);
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggleOpen() {
    if (!this.open()) {
      const base = this.parseDate(this.value) ?? new Date();
      this.viewYear.set(base.getFullYear());
      this.viewMonth.set(base.getMonth());

      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      this.openUpward.set(spaceBelow < this.panelHeight && spaceAbove > spaceBelow);
    }
    this.open.set(!this.open());
  }

  closeCalendar() {
    this.open.set(false);
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  private toDateString(year: number, month: number, day: number): string {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  monthLabel(): string {
    return `${this.monthNames[this.viewMonth()]} ${this.viewYear()}`;
  }

  displayValue(): string {
    const parsed = this.parseDate(this.value);
    if (!parsed) return '';
    return `${this.monthNames[parsed.getMonth()].slice(0, 3)} ${parsed.getDate()}, ${parsed.getFullYear()}`;
  }

  prevMonth() {
    const month = this.viewMonth() - 1;
    if (month < 0) {
      this.viewMonth.set(11);
      this.viewYear.set(this.viewYear() - 1);
    } else {
      this.viewMonth.set(month);
    }
  }

  nextMonth() {
    const month = this.viewMonth() + 1;
    if (month > 11) {
      this.viewMonth.set(0);
      this.viewYear.set(this.viewYear() + 1);
    } else {
      this.viewMonth.set(month);
    }
  }

  calendarCells(): (DayCell | null)[] {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = this.toDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const cells: (DayCell | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.toDateString(year, month, day);
      cells.push({
        date: dateStr,
        day,
        inCurrentMonth: true,
        isToday: dateStr === today,
        isSelected: dateStr === this.value,
      });
    }
    return cells;
  }

  selectDay(cell: DayCell | null) {
    if (!cell) return;
    this.valueChange.emit(cell.date);
    this.closeCalendar();
  }

  selectToday() {
    const now = new Date();
    const dateStr = this.toDateString(now.getFullYear(), now.getMonth(), now.getDate());
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth());
    this.valueChange.emit(dateStr);
    this.closeCalendar();
  }
}
