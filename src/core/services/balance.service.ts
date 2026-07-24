import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface CurrentBalance {
    amount: number;
    date: string | null;
    currency: string;
}

export interface BalanceTotal {
    total: number;
    currentBalance: number;
    income: number;
    expense: number;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    countryCode: string;
}

@Injectable({ providedIn: 'root' })
export class BalanceService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/balance';

    getBalance(): Observable<CurrentBalance> {
        return this.http.get<{ success: true; data: CurrentBalance }>(this.apiUrl)
            .pipe(map(res => res.data));
    }

    saveBalance(balance: CurrentBalance): Observable<CurrentBalance> {
        return this.http.put<{ success: true; data: CurrentBalance }>(this.apiUrl, balance)
            .pipe(map(res => res.data));
    }

    getTotal(): Observable<BalanceTotal> {
        return this.http.get<{ success: true; data: BalanceTotal }>(`${this.apiUrl}/total`)
            .pipe(map(res => res.data));
    }

    getCurrencies(): Observable<Currency[]> {
        return this.http.get<{ success: true; data: Currency[] }>(`${this.apiUrl}/currencies`)
            .pipe(map(res => res.data));
    }
}
