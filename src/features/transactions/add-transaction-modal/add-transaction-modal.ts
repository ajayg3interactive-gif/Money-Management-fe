import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-transaction-modal',
  imports: [],
  templateUrl: './add-transaction-modal.html',
  styleUrl: './add-transaction-modal.css',
})
export class AddTransactionModal {

  @Output() closemodal = new EventEmitter();

  closeModal() {
    this.closemodal.emit(false)

  }
}
