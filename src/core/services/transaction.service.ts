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

export interface ColumnGroup {
    [key: string]: TransactionColumn[];
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000';

    getTransactions(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(this.apiUrl + "/transaction");
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

    deleteTransaction(id : any):Observable<void>{
        return this.http.delete<void>(this.apiUrl+"/transaction/" + id)
    }
}