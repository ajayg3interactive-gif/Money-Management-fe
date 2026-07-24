import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from "../../../../shared/icons/icons.component";
import { CurrencyDropdown } from '../../../../shared/currency-dropdown/currency-dropdown';
import { BalanceService, Currency } from '../../../../core/services/balance.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error';

@Component({
  selector: 'current-balance-menu',
  imports: [IconComponent, FormsModule, CurrencyDropdown],
  templateUrl: './current-balance-menu.html',
  styleUrl: './current-balance-menu.css',
})
export class CurrentBalanceMenu implements OnInit {
  private balanceService = inject(BalanceService);
  private toast = inject(ToastService);

  currencies = signal<Currency[]>([]);
  currency = signal('USD');
  amount = signal<number | null>(null);
  date = signal('');
  saving = signal(false);

  currencySymbol = computed(() => {
    const match = this.currencies().find(c => c.code === this.currency());
    return match?.symbol ?? '$';
  });

  ngOnInit() {
    this.balanceService.getCurrencies().subscribe(currencies => {
      this.currencies.set(currencies);
    });

    this.balanceService.getBalance().subscribe(balance => {
      this.currency.set(balance.currency);
      this.amount.set(balance.amount);
      this.date.set(balance.date ?? '');
    });
  }

  handleSave() {
    this.saving.set(true);
    this.balanceService
      .saveBalance({
        amount: this.amount() ?? 0,
        date: this.date(),
        currency: this.currency(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Current balance saved successfully.');
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error(extractErrorMessage(err, 'Could not save current balance. Please try again.'));
        },
      });
  }
}
