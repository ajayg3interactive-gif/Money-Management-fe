import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Table } from '../../../shared/table/table';
import { Budget as BudgetModel, BudgetColumn, BudgetService } from '../../../core/services/budget.service';
import { BudgetStatusModal } from '../../dashboard/budget-status-modal/budget-status-modal';
import { Category, CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-budget',
  imports: [Table, BudgetStatusModal],
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
    this.budgetService.getBudgets().subscribe(data => {
      this.rows.set(data);
    });
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
    this.budgetService.deleteBudget(row.id).subscribe({
      next: () => this.loadBudgets(),
      error: (err) => console.error('Failed to delete budget', err),
    });
  }

  onBudgetsChanged() {
    this.loadBudgets();
  }
}
