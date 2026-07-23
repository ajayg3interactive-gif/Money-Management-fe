import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DropdownService } from "./dropdown.service";

export interface Category {
    _id?: string;
    label: string;
    value: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private dropdownService = inject(DropdownService);

    getCategories(): Observable<Category[]> {
        return this.dropdownService.getOptions('category');
    }
}
