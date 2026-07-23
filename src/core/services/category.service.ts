import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Category {
    _id?: string;
    label: string;
    value: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiOrigin + '/api/categories';

    getCategories(): Observable<Category[]> {
        return this.http.get<{ success: true; data: Category[] }>(this.apiUrl)
            .pipe(map(res => res.data));
    }
}
