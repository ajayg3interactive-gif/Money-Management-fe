import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ExpenseReport, Totals, TransactionService } from '../../../core/services/transaction.service';
import { BudgetStatusModal } from "../budget-status-modal/budget-status-modal";
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
  description: string;
  category: string;
  amount: number;
  date: string;
  color: string;
  initials: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, BudgetStatusModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private transactionService = inject(TransactionService)
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);

  totals = signal<Totals[]>([]);

  spendingPerMonth = signal<ExpenseReport[]>([]);

  budgets = signal<Budget[]>([]);
  categories = signal<Category[]>([]);

  budgetStatusModal = signal(false) ;

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

  ngOnInit() {
    this.transactionService.getTotals().subscribe(data => {
      this.totals.set(data);
    })
    this.transactionService.getExpenseReport().subscribe(data => {
      this.spendingPerMonth.set(data)
    })
    this.categoryService.getCategories().subscribe(data => {
      this.categories.set(data)
    })
    this.loadBudgets();
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

  now = new Date();
  currentMonth = this.now.toLocaleDateString('en-US', { month: "long" });

  color = [
    '#5B6EF5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'
  ]

  recentTransactions: RecentTx[] = [
    {
      description: 'Grocery Shopping',
      category: 'Food',
      amount: -85,
      date: 'Today, 9:45 AM',
      color: '#5B6EF5',
      initials: 'GS',
    },
    {
      description: 'Salary Deposit',
      category: 'Income',
      amount: 4100,
      date: 'Today, 8:00 AM',
      color: '#10B981',
      initials: 'SD',
    },
    {
      description: 'Uber Ride',
      category: 'Transport',
      amount: -24,
      date: 'Yesterday, 6:30 PM',
      color: '#F59E0B',
      initials: 'UR',
    },
    {
      description: 'Netflix Subscription',
      category: 'Entertainment',
      amount: -15,
      date: 'Yesterday, 2:00 AM',
      color: '#EF4444',
      initials: 'NF',
    },
    {
      description: 'Electricity Bill',
      category: 'Utilities',
      amount: -120,
      date: '2 days ago',
      color: '#8B5CF6',
      initials: 'EB',
    },
  ];

  formatAmount(amount: number): string {
    return 'Rs ' + Math.abs(amount).toLocaleString('en-IN');
  }
}
