import { Component, inject, OnInit, signal } from '@angular/core';
import { Table } from "../../../shared/table/table";
import { AddTransactionModal } from "../add-transaction-modal/add-transaction-modal";
import { Transaction, TransactionService, TransactionColumn } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transactions',
  imports: [Table, AddTransactionModal],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService)

  rows = signal<Transaction[]>([]);
  columns = signal<TransactionColumn[]>([])
  isLoading = signal(true);
  error = signal<string | null>(null);
  openModal = signal (false);
  selectedTransaction = signal<Transaction | null>(null);

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

  onDeleteRow(row:Transaction){
    if(!row.id) return ;
    this.transactionService.deleteTransaction(row.id).subscribe({
      next :()=>{
        this.rows.update(current => current.filter(r =>r.id !== row.id));
      },
      error : (err) => console.error('Failed to Delete',err)
    })

  }
}
