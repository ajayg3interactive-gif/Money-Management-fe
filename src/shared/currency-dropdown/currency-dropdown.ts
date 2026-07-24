import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Currency } from '../../core/services/balance.service';

@Component({
  selector: 'app-currency-dropdown',
  imports: [FormsModule],
  templateUrl: './currency-dropdown.html',
  styleUrl: './currency-dropdown.css',
})
export class CurrencyDropdown {
  @Input() currencies: Currency[] = [];
  @Input() value = '';
  @Input() placeholder = 'Select currency…';

  @Output() valueChange = new EventEmitter<string>();

  open = signal(false);
  search = signal('');

  filteredCurrencies = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.currencies;
    return this.currencies.filter(
      c => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)
    );
  });

  toggleOpen() {
    const next = !this.open();
    this.open.set(next);
    if (!next) this.search.set('');
  }

  closeDropdown() {
    this.open.set(false);
    this.search.set('');
  }

  selected(): Currency | undefined {
    return this.currencies.find(c => c.code === this.value);
  }

  selectCurrency(currency: Currency) {
    this.valueChange.emit(currency.code);
    this.closeDropdown();
  }
}
