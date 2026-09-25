import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Table } from '../../../shared/table/table';
import { Budget as BudgetModel, BudgetColumn, BudgetService } from '../../../core/services/budget.service';
import { BudgetStatusModal } from '../budget-status-modal/budget-status-modal';
import { Category, CategoryService } from '../../../core/services/category.service';
import { YearMonthFilter } from '../../../shared/year-month-filter/year-month-filter';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-budget',
  imports: [Table, BudgetStatusModal, YearMonthFilter, ConfirmDialog],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class Budget implements OnInit {
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  rows = signal<BudgetModel[]>([]);
  columns = signal<BudgetColumn[]>([]);
  categories = signal<Category[]>([]);
  openModal = signal(false);
  selectedCategory = signal<string | null>(null);
  searchTerm = signal('');
  filterYear = signal(new Date().getFullYear());
  filterMonth = signal(new Date().getMonth() + 1);
  pendingDeleteRow = signal<BudgetModel | null>(null);

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  filteredRows = computed<BudgetModel[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.rows();

    const labelByValue = new Map(this.categories().map(c => [c.value, c.label.toLowerCase()]));
    return this.rows().filter(row => {
      const label = labelByValue.get(row.category) ?? '';
      return row.category.toLowerCase().includes(term) || label.includes(term);
    });
  });

  ngOnInit() {
    this.loadBudgets();
    this.budgetService.getBudgetColumns().subscribe(data => {
      this.columns.set(data);
    });
    this.categoryService.getCategories().subscribe(data => {
      this.categories.set(data);
    });
  }

  loadBudgets() {
    this.budgetService.getBudgets(this.filterMonth(), this.filterYear()).subscribe(data => {
      this.rows.set(data);
    });
  }

  onYearChange(year: number | null) {
    this.filterYear.set(year ?? new Date().getFullYear());
    this.loadBudgets();
  }

  onMonthChange(month: number | null) {
    this.filterMonth.set(month ?? new Date().getMonth() + 1);
    this.loadBudgets();
  }

  handleModal(open: boolean) {
    this.openModal.set(open);
    this.selectedCategory.set(null);
  }

  onEditRow(row: BudgetModel) {
    this.selectedCategory.set(row.category);
    this.openModal.set(true);
  }

  onDeleteRow(row: BudgetModel) {
    if (!row.id) return;
    this.pendingDeleteRow.set(row);
  }

  cancelDelete() {
    this.pendingDeleteRow.set(null);
  }

  confirmDelete() {
    const row = this.pendingDeleteRow();
    if (!row?.id) return;
    this.budgetService.deleteBudget(row.id).subscribe({
      next: () => {
        this.loadBudgets();
        this.pendingDeleteRow.set(null);
      },
      error: (err) => {
        console.error('Failed to delete budget', err);
        this.pendingDeleteRow.set(null);
      },
    });
  }

  onBudgetsChanged() {
    this.loadBudgets();
  }
}
