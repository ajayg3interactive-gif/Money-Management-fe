import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export type RecurringFrequency = 'monthly-same-day' | 'every-n-days';

export interface RecurringRule {
    id?: string;
    description: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
    startDate: string;
    endDate: string | null;
    frequency: RecurringFrequency;
    interval: number | null;
    active: boolean;
}

export type OccurrenceStatus = 'pending' | 'held' | 'posted';

export interface Occurrence {
    ruleId: string;
    date: string;
    status: OccurrenceStatus;
    transactionId: string | null;
    description: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
}

@Injectable({ providedIn: 'root' })
export class RecurringTransactionService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/recurring';

    getRules(): Observable<RecurringRule[]> {
        return this.http.get<{ success: true; data: RecurringRule[] }>(`${this.apiUrl}/rules`)
            .pipe(map(res => res.data));
    }

    addRule(rule: Omit<RecurringRule, 'id' | 'active'>): Observable<RecurringRule> {
        return this.http
            .post<{ success: true; data: RecurringRule }>(`${this.apiUrl}/rules`, rule)
            .pipe(map(res => res.data));
    }

    setActive(id: string, active: boolean): Observable<RecurringRule> {
        return this.http
            .patch<{ success: true; data: RecurringRule }>(`${this.apiUrl}/rules/${id}/active`, { active })
            .pipe(map(res => res.data));
    }

    deleteRule(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/rules/${id}`);
    }

    getOccurrences(month: number, year: number): Observable<Occurrence[]> {
        return this.http
            .get<{ success: true; data: Occurrence[] }>(`${this.apiUrl}/occurrences`, { params: { month, year } })
            .pipe(map(res => res.data));
    }

    holdOccurrence(ruleId: string, date: string): Observable<Occurrence> {
        return this.http
            .post<{ success: true; data: Occurrence }>(`${this.apiUrl}/occurrences/hold`, { ruleId, date })
            .pipe(map(res => res.data));
    }

    unholdOccurrence(ruleId: string, date: string): Observable<Occurrence> {
        return this.http
            .post<{ success: true; data: Occurrence }>(`${this.apiUrl}/occurrences/unhold`, { ruleId, date })
            .pipe(map(res => res.data));
    }
}
