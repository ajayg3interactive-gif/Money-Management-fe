import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecurringRule, RecurringTransactionService } from '../../../core/services/recurring-transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { Category, CategoryService } from '../../../core/services/category.service';
import { CategoryDropdown } from '../../../shared/category-dropdown/category-dropdown';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-recurring-modal',
  imports: [FormsModule, CategoryDropdown],
  templateUrl: './add-recurring-modal.html',
  styleUrl: './add-recurring-modal.css',
})
export class AddRecurringModal implements OnInit, OnChanges {
  private recurringService = inject(RecurringTransactionService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);
  authService = inject(AuthService);

  @Input() startDate = '';
  @Output() closemodal = new EventEmitter();
  @Output() ruleAdded = new EventEmitter<RecurringRule>();

  type = signal<'Expense' | 'Income'>('Expense');
  amount = signal(0);
  category = signal('');
  description = signal('');
  frequency = signal<'monthly-same-day' | 'every-n-days'>('monthly-same-day');
  interval = signal(7);
  endDate = signal('');
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  ngOnChanges() {
    this.type.set('Expense');
    this.amount.set(0);
    this.category.set('');
    this.description.set('');
    this.frequency.set('monthly-same-day');
    this.interval.set(7);
    this.endDate.set('');
  }

  closeModal() {
    this.closemodal.emit(false);
  }

  setType(value: 'Expense' | 'Income') {
    this.type.set(value);
  }

  setFrequency(value: 'monthly-same-day' | 'every-n-days') {
    this.frequency.set(value);
  }

  handleSave() {
    const rule: Omit<RecurringRule, 'id' | 'active'> = {
      description: this.description(),
      category: this.category(),
      amount: this.amount(),
      type: this.type(),
      startDate: this.startDate,
      endDate: this.endDate() || null,
      frequency: this.frequency(),
      interval: this.frequency() === 'every-n-days' ? this.interval() : null,
    };

    this.recurringService.addRule(rule).subscribe({
      next: (saved) => {
        this.toast.success('Auto transaction scheduled.');
        this.ruleAdded.emit(saved);
        this.closeModal();
      },
      error: (err) => this.toast.error(extractErrorMessage(err, 'Could not schedule this transaction. Please try again.')),
    });
  }
}
