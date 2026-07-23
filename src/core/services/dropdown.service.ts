import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface DropdownOption {
    _id?: string;
    label: string;
    value: string;
    position?: number;
}

@Injectable({ providedIn: 'root' })
export class DropdownService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/dropdowns';

    getOptions(type: string): Observable<DropdownOption[]> {
        return this.http.get<{ success: true; data: DropdownOption[] }>(`${this.apiUrl}/${type}`)
            .pipe(map(res => res.data));
    }
}
