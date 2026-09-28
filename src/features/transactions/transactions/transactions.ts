import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Table } from "../../../shared/table/table";
import { AddTransactionModal } from "../add-transaction-modal/add-transaction-modal";
import { YearMonthFilter } from "../../../shared/year-month-filter/year-month-filter";
import { ConfirmDialog } from "../../../shared/confirm-dialog/confirm-dialog";
import { ImportErrorsModal } from "../../../shared/import-errors-modal/import-errors-modal";
import { Transaction, TransactionService, TransactionColumn } from '../../../core/services/transaction.service';
import { Category, CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/api-error';
import { formatDdMmmYyyy, parseDdMmmYyyy } from '../../../shared/utils/date-format';
import { escapeCsvCell, parseCsv } from '../../../shared/utils/csv';

const IMPORT_COLUMNS = ['date', 'description', 'category', 'amount', 'type'] as const;
const IMPORT_LABELS: Record<(typeof IMPORT_COLUMNS)[number], string> = {
  date: 'Date',
  description: 'Description',
  category: 'Category',
  amount: 'Amount',
  type: 'Type',
};

@Component({
  selector: 'app-transactions',
  imports: [Table, AddTransactionModal, YearMonthFilter, ConfirmDialog, ImportErrorsModal],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private transactionService = inject(TransactionService)
  private categoryService = inject(CategoryService)
  private toast = inject(ToastService)

  rows = signal<Transaction[]>([]);
  columns = signal<TransactionColumn[]>([])
  categories = signal<Category[]>([])
  isLoading = signal(true);
  error = signal<string | null>(null);
  openModal = signal (false);
  selectedTransaction = signal<Transaction | null>(null);
  filterType = signal<'All' | 'Income' | 'Expense'>('All');
  filterYear = signal<number | null>(null);
  filterMonth = signal<number | null>(null);
  searchTerm = signal('');
  pendingDeleteRow = signal<Transaction | null>(null);
  importErrors = signal<string[]>([]);
  isImporting = signal(false);

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

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
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
exportCsv() {
    const columns = this.columns().filter(c => c.view && c.key !== 'action');
    const rows = this.filteredRows();

    const getCellValue = (row: Transaction, key: string) =>
      key === 'date' ? `="${formatDdMmmYyyy(row.date)}"` : (row as any)[key];

    const header = columns.map(c => escapeCsvCell(c.label)).join(',');
    const body = rows
      .map(row => columns.map(c => escapeCsvCell(getCellValue(row, c.key))).join(','))
      .join('\n');
    const csv = [header, body].filter(Boolean).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `transactions-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  onImportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    file.text().then(text => this.processImportFile(text));
  }

  private processImportFile(text: string) {
    const table = parseCsv(text);
    if (table.length === 0) {
      this.importErrors.set(['The file is empty.']);
      return;
    }

    const [headerRow, ...dataRows] = table;
    const normalizedHeader = headerRow.map(h => h.trim().toLowerCase());

    const headerErrors: string[] = [];
    const columnIndex: Partial<Record<(typeof IMPORT_COLUMNS)[number], number>> = {};
    for (const key of IMPORT_COLUMNS) {
      const idx = normalizedHeader.indexOf(IMPORT_LABELS[key].toLowerCase());
      if (idx === -1) {
        headerErrors.push(`Missing required column: "${IMPORT_LABELS[key]}"`);
      } else {
        columnIndex[key] = idx;
      }
    }

    if (headerErrors.length > 0) {
      this.importErrors.set(headerErrors);
      return;
    }

    if (dataRows.length === 0) {
      this.importErrors.set(['The file has no data rows.']);
      return;
    }

    const categories = this.categories();
    if (categories.length === 0) {
      this.importErrors.set(['Categories are still loading. Please try importing again in a moment.']);
      return;
    }
    const categoryByKey = new Map<string, string>();
    for (const cat of categories) {
      categoryByKey.set(cat.value.toLowerCase(), cat.value);
      categoryByKey.set(cat.label.toLowerCase(), cat.value);
    }
    const validCategoryLabels = categories.map(c => c.label).join(', ');

    const rowErrors: string[] = [];
    const validTransactions: Transaction[] = [];

    dataRows.forEach((cells, i) => {
      const rowNum = i + 2; // 1-based, plus header row
      const get = (key: (typeof IMPORT_COLUMNS)[number]) => (cells[columnIndex[key]!] ?? '').trim();

      const dateRaw = get('date');
      const description = get('description');
      const categoryRaw = get('category');
      const amountRaw = get('amount');
      const typeRaw = get('type');

      const date = parseDdMmmYyyy(dateRaw);
      if (!date) {
        rowErrors.push(`Row ${rowNum}: "Date" must be in DD-MMM-YYYY format (got "${dateRaw}")`);
      }

      const category = categoryRaw ? categoryByKey.get(categoryRaw.toLowerCase()) ?? null : null;
      if (!categoryRaw) {
        rowErrors.push(`Row ${rowNum}: "Category" is required`);
      } else if (!category) {
        rowErrors.push(`Row ${rowNum}: "Category" must be one of: ${validCategoryLabels} (got "${categoryRaw}")`);
      }

      const amount = Number(amountRaw);
      if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
        rowErrors.push(`Row ${rowNum}: "Amount" must be a positive number (got "${amountRaw}")`);
      }

      const type = typeRaw.trim();
      const normalizedType = type.toLowerCase() === 'income' ? 'Income'
        : type.toLowerCase() === 'expense' ? 'Expense'
        : null;
      if (!normalizedType) {
        rowErrors.push(`Row ${rowNum}: "Type" must be Income or Expense (got "${typeRaw}")`);
      }

      if (date && category && normalizedType && Number.isFinite(amount) && amount > 0) {
        validTransactions.push({ date, description, category, amount, type: normalizedType });
      }
    });

    if (rowErrors.length > 0) {
      this.importErrors.set(rowErrors);
      return;
    }

    this.submitImport(validTransactions);
  }

  private submitImport(transactions: Transaction[]) {
    this.isImporting.set(true);
    this.transactionService.bulkAddTransactions(transactions).subscribe({
      next: (saved) => {
        this.rows.update(current => [...current, ...saved]);
        this.toast.success(`Imported ${saved.length} transaction${saved.length === 1 ? '' : 's'} successfully.`);
        this.isImporting.set(false);
      },
      error: (err) => {
        this.toast.error(extractErrorMessage(err, 'Could not import transactions. Please try again.'));
        this.isImporting.set(false);
      }
    });
  }

  closeImportErrors() {
    this.importErrors.set([]);
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
