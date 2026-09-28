import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-import-errors-modal',
  templateUrl: './import-errors-modal.html',
})
export class ImportErrorsModal {
  @Input() title = 'Import failed';
  @Input() errors: string[] = [];

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
