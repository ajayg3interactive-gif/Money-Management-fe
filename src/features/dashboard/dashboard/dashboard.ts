import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { BudgetStatus, ExpenseReport, Totals, TransactionService } from '../../../core/services/transaction.service';


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
  imports: [NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private transactionService = inject(TransactionService)

  totals = signal<Totals[]>([]);

  spendingPerMonth = signal<ExpenseReport[]>([]);

  budgetStatusPerMonth = signal<BudgetStatus[]>([]);



  ngOnInit() {
    this.transactionService.getTotals().subscribe(data => {
      this.totals.set(data);
    })
    this.transactionService.getExpenseReport().subscribe(data => {
      this.spendingPerMonth.set(data)
    })

    this.transactionService.getBudgetStatus().subscribe(data => {
      this.budgetStatusPerMonth.set(data)
      console.log(data)
    })
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
