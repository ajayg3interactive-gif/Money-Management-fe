import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  Occurrence,
  RecurringRule,
  RecurringTransactionService,
} from '../../../core/services/recurring-transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { AddRecurringModal } from '../add-recurring-modal/add-recurring-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ProductTourService } from '../../../shared/product-tour/product-tour.service';
import { Skeleton } from '../../../shared/skeleton/skeleton';

interface DayCell {
  day: number;
  date: string;
  isToday: boolean;
  occurrences: Occurrence[];
}

@Component({
  selector: 'app-plan',
  imports: [AddRecurringModal, Skeleton],
  templateUrl: './plan.html',
  styleUrl: './plan.css',
})
export class Plan implements OnInit {
  private recurringService = inject(RecurringTransactionService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private productTourService = inject(ProductTourService);

  private now = new Date();
  viewYear = signal(this.now.getFullYear());
  viewMonth = signal(this.now.getMonth() + 1); // 1-12

  occurrences = signal<Occurrence[]>([]);
  rules = signal<RecurringRule[]>([]);
  isOccurrencesLoading = signal(true);
  isRulesLoading = signal(true);

  addModalOpen = signal(false);
  selectedDate = signal('');

  monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth() - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  );

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Placeholder cell count for the loading grid - a typical month view (5 weeks). */
  skeletonCellIndexes = Array.from({ length: 35 }, (_, i) => i);

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

  /** Ruleid+date of the first occurrence badge rendered on the calendar, used to anchor the tour. */
  firstOccurrenceKey = computed<string | null>(() => {
    for (const cell of this.calendarCells()) {
      if (cell && cell.occurrences.length > 0) {
        const occ = cell.occurrences[0];
        return `${occ.ruleId}-${occ.date}`;
      }
    }
    return null;
  });

  isFirstOccurrence(occ: Occurrence): boolean {
    return `${occ.ruleId}-${occ.date}` === this.firstOccurrenceKey();
  }

  /** Shown as a stand-in on the 1st of the month during the tour when no real occurrence
   * exists yet to highlight - never persisted, removed as soon as the tour ends. */
  demoBadgeActive = signal(false);

  ngOnInit() {
    // Wait for real occurrence data before deciding whether a demo badge is needed,
    // so the tour never shows one alongside an actual occurrence.
    this.loadOccurrences(() => this.startProductTour());
    this.loadRules();
  }

  private startProductTour() {
    // Skip entirely if this account has already completed it - otherwise the demo badge
    // would flash on every page load/refresh even though no tour is actually starting.
    // Once seen, it's only reachable again via Help > Tutorial.
    if (this.authService.currentUser()?.planTourSeen) {
      return;
    }

    if (!this.firstOccurrenceKey()) {
      this.demoBadgeActive.set(true);
    }

    this.productTourService.startTour('plan-onboarding', {
      onDestroyed: () => {
        this.demoBadgeActive.set(false);
        this.authService.markTourSeen('plan-onboarding').subscribe();
      },
    });
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  loadOccurrences(onLoaded?: () => void) {
    this.isOccurrencesLoading.set(true);
    this.recurringService.getOccurrences(this.viewMonth(), this.viewYear()).subscribe({
      next: (data) => {
        this.occurrences.set(data);
        this.isOccurrencesLoading.set(false);
        onLoaded?.();
      },
      error: (err) => {
        console.error('Failed to load occurrences', err);
        this.isOccurrencesLoading.set(false);
      },
    });
  }

  loadRules() {
    this.isRulesLoading.set(true);
    this.recurringService.getRules().subscribe({
      next: (data) => {
        this.rules.set(data);
        this.isRulesLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load rules', err);
        this.isRulesLoading.set(false);
      },
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
    return this.authService.currencySymbol() + ' ' + Math.abs(amount).toLocaleString('en-IN');
  }

  /** Explains why a monthly occurrence isn't on its usual day of the month. */
  adjustedMessage(occ: Occurrence): string {
    const day = occ.scheduledDay ?? 0;
    const month = new Date(this.viewYear(), this.viewMonth() - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
    });
    const lastDay = Number(occ.date.slice(8, 10));
    return `Scheduled for the ${this.ordinal(day)} of every month, but ${month} only has ${lastDay} days. It runs on the last day of the month instead (${month} ${lastDay}).`;
  }

  private ordinal(n: number): string {
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
    const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
    const suffix = suffixes[n % 10] ?? 'th';
    return `${n}${suffix}`;
  }

  statusColor(status: Occurrence['status']): string {
    if (status === 'posted') return '#10b981';
    if (status === 'held') return '#f59e0b';
    return '#5b6ef5';
  }
}
