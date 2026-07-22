import { Component, computed, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Budget, BudgetService } from '../../../core/services/budget.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { CategoryDropdown } from '../../../shared/category-dropdown/category-dropdown';

@Component({
  selector: 'app-budget-status-modal',
  imports: [FormsModule, CategoryDropdown],
  templateUrl: './budget-status-modal.html',
  styleUrl: './budget-status-modal.css',
})
export class BudgetStatusModal implements OnInit {

  private categoryService = inject(CategoryService);
  private budgetService = inject(BudgetService);
  private toast = inject(ToastService);

  @Output() closemodal = new EventEmitter();
  @Output() budgetAdded = new EventEmitter<Budget>();
  @Output() budgetUpdated = new EventEmitter<Budget>();
  @Output() budgetDeleted = new EventEmitter<string>();

  amount = signal(0);
  category = signal("")
  categories = signal<Category[]>([]);
  budgets = signal<Budget[]>([]);

  editingBudgetId = signal<string | null>(null);

  editableCategoryValues = computed(() =>
    this.categories()
      .filter(cat => this.budgetForCategory(cat.value))
      .map(cat => cat.value)
  );

  ngOnInit() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
    this.loadBudgets();
  }

  ngOnChanges() {
    //  this.amount.set(this.editData.amount);
  }

  loadBudgets() {
    this.budgetService.getBudgets().subscribe(budgets => {
      this.budgets.set(budgets);
    });
  }

  closeModal() {
    this.closemodal.emit(false)
  }

  budgetForCategory(value: string): Budget | undefined {
    return this.budgets().find(b => b.category === value && b.maximum > 0);
  }

  onCategorySelected(value: string) {
    this.category.set(value);
    const existing = this.budgetForCategory(value);
    this.editingBudgetId.set(existing?.id ?? null);
    this.amount.set(existing ? existing.maximum : 0);
  }

  onCategoryEdit(value: string) {
    const existing = this.budgetForCategory(value);
    if (!existing) return;
    this.category.set(existing.category);
    this.amount.set(existing.maximum);
    this.editingBudgetId.set(existing.id ?? null);
  }

  handleSave() {
    const editingId = this.editingBudgetId();

    if (!this.category()) {
      this.toast.error('Please select a category.');
      return;
    }

    if (this.amount() <= 0) {
      if (!editingId) {
        this.toast.error('Please enter a valid maximum amount.');
        return;
      }

      this.budgetService.deleteBudget(editingId).subscribe({
        next: () => {
          this.toast.success('Budget removed.');
          this.budgetDeleted.emit(editingId);
          this.closeModal();
        },
        error: (err) => this.toast.error(extractErrorMessage(err, 'Could not remove budget. Please try again.'))
      });
      return;
    }

    const budget: Budget = {
      category: this.category(),
      maximum: this.amount(),
    };

    if (editingId) {
      this.budgetService.updateBudget(editingId, budget).subscribe({
        next: (updated) => {
          this.toast.success('Budget updated successfully.');
          this.budgetUpdated.emit(updated);
          this.closeModal();
        },
        error: (err) => this.toast.error(extractErrorMessage(err, 'Could not update budget. Please try again.'))
      });
      return;
    }

    this.budgetService.addBudget(budget).subscribe({
      next: (saved) => {
        this.toast.success('Budget saved successfully.');
        this.budgetAdded.emit(saved);
        this.closeModal();
      },
      error: (err) => this.toast.error(extractErrorMessage(err, 'Could not save budget. Please try again.'))
    });
  }

}
