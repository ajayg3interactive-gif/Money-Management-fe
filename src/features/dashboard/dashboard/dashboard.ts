import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

interface SummaryCard {
  id: number;
  label: string;
  amount: number;
  percent: number;
  trend: 'up' | 'down';
  gradientFrom: string;
  gradientTo: string;
}

interface CategoryItem {
  label: string;
  amount: number;
  percent: number;
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
  imports: [NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  currentMonth = 'June 2026';

  summaryCards: SummaryCard[] = [
    {
      id: 1,
      label: 'Total Balance',
      amount: 24500,
      percent: 12.5,
      trend: 'up',
      gradientFrom: '#5B6EF5',
      gradientTo: '#8B5CF6',
    },
    {
      id: 2,
      label: 'Monthly Income',
      amount: 8200,
      percent: 5.2,
      trend: 'up',
      gradientFrom: '#059669',
      gradientTo: '#34D399',
    },
    {
      id: 3,
      label: 'Monthly Expenses',
      amount: 3750,
      percent: 8.3,
      trend: 'down',
      gradientFrom: '#DC2626',
      gradientTo: '#F87171',
    },
    {
      id: 4,
      label: 'Total Savings',
      amount: 12500,
      percent: 15.8,
      trend: 'up',
      gradientFrom: '#D97706',
      gradientTo: '#FBBF24',
    },
  ];

  categorySpending: CategoryItem[] = [
    { label: 'Food & Dining', amount: 1200, percent: 32, color: '#5B6EF5' },
    { label: 'Transportation', amount: 850, percent: 22.7, color: '#10B981' },
    { label: 'Shopping', amount: 650, percent: 17.3, color: '#F59E0B' },
    { label: 'Entertainment', amount: 520, percent: 13.9, color: '#EF4444' },
    { label: 'Utilities', amount: 380, percent: 10.1, color: '#8B5CF6' },
    { label: 'Other', amount: 150, percent: 4.0, color: '#64748B' },
  ];

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
    return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
  }
}
