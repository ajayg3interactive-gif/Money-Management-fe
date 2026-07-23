import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  Occurrence,
  RecurringRule,
  RecurringTransactionService,
} from '../../../core/services/recurring-transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { AddRecurringModal } from '../add-recurring-modal/add-recurring-modal';

interface DayCell {
  day: number;
  date: string;
  isToday: boolean;
  occurrences: Occurrence[];
}

@Component({
  selector: 'app-plan',
  imports: [AddRecurringModal],
  templateUrl: './plan.html',
  styleUrl: './plan.css',
})
export class Plan implements OnInit {
  private recurringService = inject(RecurringTransactionService);
  private toast = inject(ToastService);

  private now = new Date();
  viewYear = signal(this.now.getFullYear());
  viewMonth = signal(this.now.getMonth() + 1); // 1-12

  occurrences = signal<Occurrence[]>([]);
  rules = signal<RecurringRule[]>([]);

  addModalOpen = signal(false);
  selectedDate = signal('');

  monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth() - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  );

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  calendarCells = computed<(DayCell | null)[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const todayStr = this.formatDate(this.now);

    const occByDate = new Map<string, Occurrence[]>();
    for (const occ of this.occurrences()) {
      const list = occByDate.get(occ.date) ?? [];
      list.push(occ);
      occByDate.set(occ.date, list);
    }

    const cells: (DayCell | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= totalDays; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        date,
        isToday: date === todayStr,
        occurrences: occByDate.get(date) ?? [],
      });
    }
    return cells;
  });

  ngOnInit() {
    this.loadOccurrences();
    this.loadRules();
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  loadOccurrences() {
    this.recurringService.getOccurrences(this.viewMonth(), this.viewYear()).subscribe(data => {
      this.occurrences.set(data);
    });
  }

  loadRules() {
    this.recurringService.getRules().subscribe(data => {
      this.rules.set(data);
    });
  }

  prevMonth() {
    let month = this.viewMonth() - 1;
    let year = this.viewYear();
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    this.viewMonth.set(month);
    this.viewYear.set(year);
    this.loadOccurrences();
  }

  nextMonth() {
    let month = this.viewMonth() + 1;
    let year = this.viewYear();
    if (month > 12) {
      month = 1;
      year += 1;
    }
    this.viewMonth.set(month);
    this.viewYear.set(year);
    this.loadOccurrences();
  }

  openAddModal(date: string) {
    this.selectedDate.set(date);
    this.addModalOpen.set(true);
  }

  closeAddModal() {
    this.addModalOpen.set(false);
  }

  onRuleAdded() {
    this.loadOccurrences();
    this.loadRules();
  }

  toggleHold(occ: Occurrence, event: Event) {
    event.stopPropagation();
    if (occ.status === 'held') {
      this.recurringService.unholdOccurrence(occ.ruleId, occ.date).subscribe({
        next: () => {
          this.toast.success('Auto transaction resumed.');
          this.loadOccurrences();
        },
        error: (err) => this.toast.error(extractErrorMessage(err, 'Could not resume this transaction.')),
      });
    } else {
      this.recurringService.holdOccurrence(occ.ruleId, occ.date).subscribe({
        next: () => {
          this.toast.success('Auto transaction held.');
          this.loadOccurrences();
        },
        error: (err) => this.toast.error(extractErrorMessage(err, 'Could not hold this transaction.')),
      });
    }
  }

  toggleRuleActive(rule: RecurringRule) {
    if (!rule.id) return;
    this.recurringService.setActive(rule.id, !rule.active).subscribe({
      next: () => this.loadRules(),
      error: (err) => this.toast.error(extractErrorMessage(err, 'Could not update this rule.')),
    });
  }

  deleteRule(rule: RecurringRule) {
    if (!rule.id) return;
    this.recurringService.deleteRule(rule.id).subscribe({
      next: () => {
        this.toast.success('Auto transaction removed.');
        this.loadRules();
        this.loadOccurrences();
      },
      error: (err) => this.toast.error(extractErrorMessage(err, 'Could not delete this rule.')),
    });
  }

  formatAmount(amount: number): string {
    return 'Rs ' + Math.abs(amount).toLocaleString('en-IN');
  }

  statusColor(status: Occurrence['status']): string {
    if (status === 'posted') return '#10b981';
    if (status === 'held') return '#f59e0b';
    return '#5b6ef5';
  }
}
