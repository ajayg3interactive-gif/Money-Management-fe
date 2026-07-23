import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Budget {
    id?: string;
    category: string;
    maximum: number;
    /** Amount already spent in this category this month. Computed server-side; only present on GET responses. */
    spent?: number;
}

export interface BudgetColumn {
    position: number,
    key: string,
    label: string,
    view: boolean
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/budgets';

    getBudgets(): Observable<Budget[]> {
        return this.http.get<{ success: true; data: Budget[] }>(this.apiUrl)
            .pipe(map(res => res.data));
    }

    addBudget(budget: Budget): Observable<Budget> {
        return this.http
            .post<{ success: true; data: Budget }>(this.apiUrl, budget)
            .pipe(map(res => res.data));
    }

    updateBudget(id: string, budget: Budget): Observable<Budget> {
        return this.http
            .put<{ success: true; data: Budget }>(`${this.apiUrl}/${id}`, budget)
            .pipe(map(res => res.data));
    }

    deleteBudget(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getBudgetColumns(): Observable<BudgetColumn[]> {
        return this.http.get<{ budget?: BudgetColumn[] }[]>(environment.apiOrigin + '/api/transactions/columns')
            .pipe(map(data => {
                const found = data.find(item => item.hasOwnProperty('budget'));
                return found?.budget ?? [];
            }));
    }
}
