import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

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
    percent: number,
    trend: 'up' | 'down',
    gradientFrom: string,
    gradientTo: string,

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

export interface ColumnGroup {
    [key: string]: TransactionColumn[];
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/transactions';

    now = new Date();
    currentMonth = this.now.getMonth();
    currentYear = this.now.getFullYear();

    getTotals(): Observable<Totals[]> {
        return this.getTransactionsPermonth().pipe(
            map(transactions => {

                const totalIncome = transactions
                    .filter(t => t.type === "Income")
                    .reduce((sum, t) => sum + t.amount, 0)

                const totalExpense = transactions
                    .filter(t => t.type === "Expense")
                    .reduce((sum, t) => sum + t.amount, 0)


                const income = transactions
                    .filter(t => t.type === "Income")
                    .reduce((sum, t) => sum + t.amount, 0);

                const expense = transactions
                    .filter(t => t.type === 'Expense')
                    .reduce((sum, t) => sum + t.amount, 0)

                return [
                    {
                        id: 1,
                        label: 'Total Balance',
                        amount: income - expense,
                        percent: 12.5,
                        trend: 'up',
                        gradientFrom: '#5B6EF5',
                        gradientTo: '#8B5CF6',
                    },
                    {
                        id: 2,
                        label: 'Monthly Income',
                        amount: income,
                        percent: 5.2,
                        trend: 'up',
                        gradientFrom: '#059669',
                        gradientTo: '#34D399',
                    },
                    {
                        id: 3,
                        label: 'Monthly Expenses',
                        amount: expense,
                        percent: 8.3,
                        trend: 'down',
                        gradientFrom: '#DC2626',
                        gradientTo: '#F87171',
                    },
                    {
                        id: 4,
                        label: 'Total Savings',
                        amount: totalIncome - totalExpense,
                        percent: 15.8,
                        trend: 'up',
                        gradientFrom: '#D97706',
                        gradientTo: '#FBBF24',
                    },


                ]
            })

        )
    }

    getExpenseReport(): Observable<ExpenseReport[]> {
        return this.getTransactionsPermonth().pipe(
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

    getBudgetStatus(): Observable<BudgetStatus[]> {
        return this.getTransactionsPermonth().pipe(
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
    
    getTransactionsPermonth(): Observable<Transaction[]> {
        const res = this.http.get<Transaction[]>(this.apiUrl + "/transaction");

        return res.pipe(map(transactions => {

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            return transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return (
                    transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear
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
        return this.http.post<Transaction>(this.apiUrl + "/transaction", transaction)
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