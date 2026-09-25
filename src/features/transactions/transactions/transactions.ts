import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Table } from "../../../shared/table/table";
import { AddTransactionModal } from "../add-transaction-modal/add-transaction-modal";
import { YearMonthFilter } from "../../../shared/year-month-filter/year-month-filter";
import { ConfirmDialog } from "../../../shared/confirm-dialog/confirm-dialog";
import { Transaction, TransactionService, TransactionColumn } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-transactions',
  imports: [Table, AddTransactionModal, YearMonthFilter, ConfirmDialog],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService)
  private toast = inject(ToastService)

  rows = signal<Transaction[]>([]);
  columns = signal<TransactionColumn[]>([])
  isLoading = signal(true);
  error = signal<string | null>(null);
  openModal = signal (false);
  selectedTransaction = signal<Transaction | null>(null);
  filterType = signal<'All' | 'Income' | 'Expense'>('All');
  filterYear = signal<number | null>(null);
  filterMonth = signal<number | null>(null);
  searchTerm = signal('');
  pendingDeleteRow = signal<Transaction | null>(null);

  availableYears = computed(() => {
    const years = new Set(this.rows().map(r => Number(r.date.split('-')[0])));
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  });

  ngOnInit() {
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.isLoading.set(false)
      },
      error: (err) => {
        this.error.set('failed to load transaction');
        this.isLoading.set(false);
        console.error(err);
      }
    });

    this.transactionService.getTransactionsColumns().subscribe({
      next: (data) => {
        this.columns.set(data);
      }
    })
  }

  handleModal(open: boolean) {
    this.openModal.set(open);
    this.selectedTransaction.set(null);
  }

  onTransactionAdded(transaction: Transaction) {
    this.rows.update(current => [...current, transaction]); // ← append to existing rows
  }

  onTransactionUpdated(transaction: Transaction) {
    this.rows.update(current =>
      current.map(r => r.id === transaction.id ? transaction : r)
    );
  }

  onEditRow(row: Transaction) {
    this.selectedTransaction.set(row);
    this.openModal.set(true);
  }

  onDeleteRow(row: Transaction) {
    if (!row.id) return;
    this.pendingDeleteRow.set(row);
  }

  cancelDelete() {
    this.pendingDeleteRow.set(null);
  }

  confirmDelete() {
    const row = this.pendingDeleteRow();
    if (!row?.id) return;
    this.transactionService.deleteTransaction(row.id).subscribe({
      next: () => {
        this.rows.update(current => current.filter(r => r.id !== row.id));
        this.toast.success('Transaction deleted successfully.');
        this.pendingDeleteRow.set(null);
      },
      error: (err) => {
        console.error('Failed to Delete', err);
        this.toast.error(extractErrorMessage(err, 'Could not delete transaction. Please try again.'));
        this.pendingDeleteRow.set(null);
      }
    })
  }
filteredRows = computed(()=>{
  const filter = this.filterType();
  const year = this.filterYear();
  const month = this.filterMonth();
  const term = this.searchTerm().trim().toLowerCase();

  return this.rows().filter(r => {
    if (filter !== 'All' && r.type !== filter) return false;
    const [rYear, rMonth] = r.date.split('-').map(Number);
    if (year !== null && rYear !== year) return false;
    if (month !== null && rMonth !== month) return false;

    if (term) {
      const matches =
        r.date.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        String(r.amount).toLowerCase().includes(term);
      if (!matches) return false;
    }

    return true;
  });
});



  
}
