import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Transaction {
    id?: number;
    date: string,
    description: string,
    category: string,
    amount: number,
    type: string
}

export interface TransactionColumn {
    position: number,
    key: string,
    label: string,
    view: boolean
}

export interface Totals {
    id: number,
    label: string,
    amount: number,
    percent: number | null,
    trend: 'up' | 'down',
    gradientFrom: string,
    gradientTo: string,

}

export interface DashboardSummary {
    month: number,
    year: number,
    currentBalance: number,
    totalBalance: number,
    monthlyIncome: number,
    monthlyExpense: number,
    totalSavings: number,
    trends: {
        totalBalance: number | null,
        monthlyIncome: number | null,
        monthlyExpense: number | null,
        totalSavings: number | null,
    },
}

export interface ExpenseReport {
    id: number,
    label: string,
    percentage: number,
    total: number
}

export interface BudgetStatus {
    id: number,
    label: string,
    spend: number,
    maximum: number
}

export interface SavingsRate {
    netIncome: number,
    totalExpenses: number,
    netSavings: number,
    rate: number
}

export interface ColumnGroup {
    [key: string]: TransactionColumn[];
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/transactions';

    now = new Date();
    currentMonth = this.now.getMonth();
    currentYear = this.now.getFullYear();

    /** @param month 1-12, defaults to the current month */
    getSummary(month?: number): Observable<DashboardSummary> {
        const params = month ? `?month=${month}` : '';
        return this.http.get<{ success: true; data: DashboardSummary }>(`${environment.apiOrigin}/api/dashboard/summary${params}`)
            .pipe(map(res => res.data));
    }

    /** @param month 1-12, defaults to the current month */
    getTotals(month?: number): Observable<Totals[]> {
        return this.getSummary(month).pipe(
            map(summary => {
                const trend = (percent: number | null): 'up' | 'down' => percent !== null && percent < 0 ? 'down' : 'up';

                return [
                    {
                        id: 1,
                        label: 'Total Balance',
                        amount: summary.totalBalance,
                        percent: summary.trends.totalBalance,
                        trend: trend(summary.trends.totalBalance),
                        gradientFrom: '#5B6EF5',
                        gradientTo: '#8B5CF6',
                    },
                    {
                        id: 2,
                        label: 'Monthly Income',
                        amount: summary.monthlyIncome,
                        percent: summary.trends.monthlyIncome,
                        trend: trend(summary.trends.monthlyIncome),
                        gradientFrom: '#059669',
                        gradientTo: '#34D399',
                    },
                    {
                        id: 3,
                        label: 'Monthly Expenses',
                        amount: summary.monthlyExpense,
                        percent: summary.trends.monthlyExpense,
                        trend: trend(summary.trends.monthlyExpense),
                        gradientFrom: '#DC2626',
                        gradientTo: '#F87171',
                    },
                    {
                        id: 4,
                        label: 'Total Savings',
                        amount: summary.totalSavings,
                        percent: summary.trends.totalSavings,
                        trend: trend(summary.trends.totalSavings),
                        gradientFrom: '#D97706',
                        gradientTo: '#FBBF24',
                    },
                ]
            })
        )
    }

    /** @param month 1-12, defaults to the current month */
    getSavingsRate(month?: number): Observable<SavingsRate> {
        return this.getTransactionsPermonth(month).pipe(
            map(transactions => {

                const totalIncome = transactions
                    .filter(t => t.type === 'Income')
                    .reduce((sum, t) => sum + t.amount, 0);

                const billOrRentExpense = transactions
                    .filter(t => t.type === 'Expense' && /bill|rent/i.test(t.category))
                    .reduce((sum, t) => sum + t.amount, 0);

                const totalExpenses = transactions
                    .filter(t => t.type === 'Expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                const netIncome = totalIncome - billOrRentExpense;
                const netSavings = netIncome - totalExpenses;
                const rate = netIncome > 0 ? (netSavings / netIncome) * 100 : 0;

                return { netIncome, totalExpenses, netSavings, rate };
            })
        );
    }

    /** @param month 1-12, defaults to the current month */
    getExpenseReport(month?: number): Observable<ExpenseReport[]> {
        return this.getTransactionsPermonth(month).pipe(
            map(transactions => {

                const grouped = transactions
                    .filter(t => t.type === 'Expense')
                    .reduce((acc, transaction) => {
                        const category = transaction.category;

                        if (!acc[category]) {
                            acc[category] = 0;
                        }

                        acc[category] += transaction.amount;

                        return acc;
                    }, {} as Record<string, number>);

                const grandTotal = Object.values(grouped)
                    .reduce((sum, amount) => sum + amount, 0);

                return Object.entries(grouped).map(([category, total], index) => ({
                    id: index + 1,
                    label: category,
                    total,
                    percentage: grandTotal > 0
                        ? Number(((total / grandTotal) * 100).toFixed(2))
                        : 0
                }));
            })
        );
    }

    /** @param month 1-12, defaults to the current month */
    getBudgetStatus(month?: number): Observable<BudgetStatus[]> {
        return this.getTransactionsPermonth(month).pipe(
             map(transactions => {

                const grouped = transactions
                    .filter(t => t.type === 'Expense')
                    .reduce((acc, transaction) => {
                        const category = transaction.category;

                        if (!acc[category]) {
                            acc[category] = 0;
                        }

                        acc[category] += transaction.amount;

                        return acc;
                    }, {} as Record<string, number>);

                const grandTotal = Object.values(grouped)
                    .reduce((sum, amount) => sum + amount, 0);

                return Object.entries(grouped).map(([category, total], index) => ({
                    id: index + 1,
                    label: category,
                    spend:total,
                    maximum: 1000
                }));
            })
        )


    }
    
    /** @param month 1-12, defaults to the current month. Year is always the current year. */
    getTransactionsPermonth(month?: number): Observable<Transaction[]> {
        const res = this.http.get<Transaction[]>(this.apiUrl + "/transaction");

        const now = new Date();
        const targetMonth = month ? month - 1 : now.getMonth();
        const targetYear = now.getFullYear();

        return res.pipe(map(transactions => {
            return transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return (
                    transactionDate.getMonth() === targetMonth &&
                    transactionDate.getFullYear() === targetYear
                )
            })
        }))

    }

    getTransactionsColumns(): Observable<TransactionColumn[]> {
        return this.http.get<ColumnGroup[]>(this.apiUrl + "/columns")
            .pipe(
                map(data => {
                    const found = data.find(item => item.hasOwnProperty('transaction'));
                    return found ? found['transaction'] : [];
                })
            );
    }

    addTransaction(transaction: Transaction): Observable<Transaction> {
        return this.http
            .post<{ success: true; data: Transaction }>(this.apiUrl + "/transaction", transaction)
            .pipe(map(res => res.data));
    }

    updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
        return this.http.put<Transaction>(this.apiUrl + "/transaction/" + id, transaction)
    }

    deleteTransaction(id: any): Observable<void> {
        return this.http.delete<void>(this.apiUrl + "/transaction/" + id)
    }

    getTransactions(): Observable<Transaction[]>{
        return this.http.get<Transaction[]>(this.apiUrl);
    }

}