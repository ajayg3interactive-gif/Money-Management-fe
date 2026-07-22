import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction, TransactionService } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { Category, CategoryService } from '../../../core/services/category.service';
import { CategoryDropdown } from '../../../shared/category-dropdown/category-dropdown';

@Component({
  selector: 'app-add-transaction-modal',
  imports: [FormsModule, CategoryDropdown],
  templateUrl: './add-transaction-modal.html',
  styleUrl: './add-transaction-modal.css',
})
export class AddTransactionModal implements OnInit {
  private transactionService = inject(TransactionService);
  private toast = inject(ToastService);
  private categoryService = inject(CategoryService);

  @Input() editData: Transaction | null = null;
  @Output() closemodal = new EventEmitter();
  @Output() transactionAdded = new EventEmitter<Transaction>();
  @Output() transactionUpdated = new EventEmitter<Transaction>();

  isEditMode = signal(false);
  type = signal<'Expense' | 'Income'>('Expense');
  amount = signal(0);
  category = signal('');
  date = signal('');
  description = signal('');
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  ngOnChanges() {
    if (this.editData) {
      // ← populate form with existing data
      this.isEditMode.set(true);
      this.type.set(this.editData.type as 'Expense' | 'Income');
      this.amount.set(this.editData.amount);
      this.category.set(this.editData.category);
      this.date.set(this.editData.date);
      this.description.set(this.editData.description);
    } else {
      // ← reset form for add mode
      this.isEditMode.set(false);
      this.type.set('Expense');
      this.amount.set(0);
      this.category.set('');
      this.date.set('');
      this.description.set('');
    }
  }


  closeModal() {
    this.closemodal.emit(false)
  }

  setType(value: 'Expense' | 'Income') {
    this.type.set(value);
  }

  handleSave() {
    const transaction: Transaction = {
      date: this.date(),
      description: this.description(),
      category: this.category(),
      amount: this.amount(),
      type: this.type()
    };
    if (this.isEditMode() && this.editData?.id) {
      // ← UPDATE existing
      this.transactionService.updateTransaction(this.editData.id, transaction).subscribe({
        next: (updated) => {
          this.transactionUpdated.emit(updated);
          this.closeModal();
        },
        error: (err) => console.error('Failed to update:', err)
      });
    } else {
      // ← ADD new
      this.transactionService.addTransaction(transaction).subscribe({
        next: (saved) => {
          this.toast.success('Transaction added successfully.');
          this.transactionAdded.emit(saved);
          this.closeModal();
        },
        error: (err) => this.toast.error(extractErrorMessage(err, 'Could not save transaction. Please try again.'))
      });
    }
  }
}
