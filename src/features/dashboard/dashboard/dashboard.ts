import { DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ExpenseReport, SavingsRate, Totals, Transaction, TransactionService } from '../../../core/services/transaction.service';
import { BudgetStatusModal } from "../budget-status-modal/budget-status-modal";
import { AddTransactionModal } from "../../transactions/add-transaction-modal/add-transaction-modal";
import { Budget, BudgetService } from '../../../core/services/budget.service';
import { Category, CategoryService } from '../../../core/services/category.service';

interface BudgetStatusRow {
  id: string;
  label: string;
  spend: number;
  maximum: number;
  percentage: number;
  color: string;
}


interface RecentTx {
  id: string | number;
  description: string;
  category: string;
  amount: number;
  date: string;
  color: string;
  initials: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, DecimalPipe, BudgetStatusModal, AddTransactionModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private transactionService = inject(TransactionService)
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  totals = signal<Totals[]>([]);

  spendingPerMonth = signal<ExpenseReport[]>([]);

  savingsRate = signal<SavingsRate>({ netIncome: 0, totalExpenses: 0, netSavings: 0, rate: 0 });

  budgets = signal<Budget[]>([]);
  categories = signal<Category[]>([]);
  transactions = signal<Transaction[]>([]);

  budgetStatusModal = signal(false) ;

  transactionModal = signal(false);
  selectedTransaction = signal<Transaction | null>(null);

  budgetStatusList = computed<BudgetStatusRow[]>(() => {
    const spendByCategory = new Map(this.spendingPerMonth().map(s => [s.label, s.total]));

    return this.budgets().map((budget, index) => {
      const categoryInfo = this.categories().find(c => c.value === budget.category);
      const spend = spendByCategory.get(budget.category) ?? 0;

      return {
        id: budget.id ?? budget.category,
        label: categoryInfo ? categoryInfo.label : budget.category,
        spend,
        maximum: budget.maximum,
        percentage: budget.maximum > 0 ? Math.min(100, (spend / budget.maximum) * 100) : 0,
        color: this.color[index % this.color.length],
      };
    });
  });

  recentTransactions = computed<RecentTx[]>(() => {
    const categoryLookup = new Map(this.categories().map(c => [c.value, c.label]));

    return [...this.transactions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((tx, index) => {
        const signedAmount = tx.type === 'Income' ? tx.amount : -tx.amount;
        const categoryLabel = categoryLookup.get(tx.category) ?? tx.category;
        const description = tx.description?.trim() || categoryLabel;
        const initials = description
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(word => word[0]?.toUpperCase())
          .join('') || '?';

        return {
          id: tx.id ?? index,
          description,
          category: categoryLabel,
          amount: signedAmount,
          date: this.formatRelativeDate(tx.date),
          color: this.color[index % this.color.length],
          initials,
        };
      });
  });

  ngOnInit() {
    this.transactionService.getTotals().subscribe(data => {
      this.totals.set(data);
    })
    this.transactionService.getExpenseReport().subscribe(data => {
      this.spendingPerMonth.set(data)
    })
    this.transactionService.getSavingsRate().subscribe(data => {
      this.savingsRate.set(data)
    })
    this.categoryService.getCategories().subscribe(data => {
      this.categories.set(data)
    })
    this.loadTransactions();
    this.loadBudgets();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe(data => {
      this.transactions.set(data);
    })
  }

  loadBudgets() {
    this.budgetService.getBudgets().subscribe(data => {
      this.budgets.set(data)
    })
  }

  handleModal(open: boolean) {
    this.budgetStatusModal.set(open);
    if (!open) {
      this.loadBudgets();
    }
  }

  handleTransactionModal(open: boolean) {
    this.transactionModal.set(open);
    this.selectedTransaction.set(null);
  }

  refreshSummary() {
    this.transactionService.getTotals().subscribe(data => {
      this.totals.set(data);
    })
    this.transactionService.getExpenseReport().subscribe(data => {
      this.spendingPerMonth.set(data)
    })
    this.transactionService.getSavingsRate().subscribe(data => {
      this.savingsRate.set(data)
    })
    this.loadTransactions();
  }


  now = new Date();
  currentMonth = this.now.toLocaleDateString('en-US', { month: "long" });

  color = [
    '#5B6EF5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'
  ]

  clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
  }

  formatAmount(amount: number): string {
    return 'Rs ' + Math.abs(amount).toLocaleString('en-IN');
  }

  formatRelativeDate(date: string): string {
    const txDate = new Date(date);
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(today) - startOfDay(txDate)) / msPerDay);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1) return `${diffDays} days ago`;
    return txDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
}
