import { Component } from '@angular/core';
import { Table } from "../../../shared/table/table";
import { AddTransactionModal } from "../add-transaction-modal/add-transaction-modal";

@Component({
  selector: 'app-transactions',
  imports: [Table, AddTransactionModal],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {

  columns = [
    { position: 1, key: 'date', label: 'Date', view: true },
    { position: 2, key: 'description', label: 'Description', view: true },
    { position: 3, key: 'category', label: 'Category', view: true },
    { position: 4, key: 'amount', label: 'Amount', view: true },
    { position: 5, key: 'action', label: 'Action', view: true },
  ];

  rows = [
    { date: '12/05/2006', description: 'This layout will look similar to modern fintech', category: 'Travel', amount: 200 },
    { date: '14/05/2006', description: 'Grocery shopping at the market', category: 'Food', amount: 85 },
  ];
  openModal = false;

  handleModal(open:boolean) {
    this.openModal = open;

  }
}
