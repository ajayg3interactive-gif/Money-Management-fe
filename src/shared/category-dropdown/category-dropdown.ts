import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Category } from '../../core/services/category.service';

@Component({
  selector: 'app-category-dropdown',
  templateUrl: './category-dropdown.html',
  styleUrl: './category-dropdown.css',
})
export class CategoryDropdown {
  @Input() categories: Category[] = [];
  @Input() value = '';
  @Input() placeholder = 'Select…';
  @Input() showEditIcon = false;
  @Input() editableValues: string[] = [];

  @Output() valueChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  open = signal(false);

  toggleOpen() {
    this.open.set(!this.open());
  }

  closeDropdown() {
    this.open.set(false);
  }

  isEditable(value: string): boolean {
    return this.editableValues.includes(value);
  }

  selectedLabel(): string {
    const selected = this.categories.find(c => c.value === this.value);
    return selected ? selected.label : '';
  }

  selectCategory(cat: Category) {
    this.valueChange.emit(cat.value);
    this.closeDropdown();
  }

  onEditClick(event: Event, value: string) {
    event.stopPropagation();
    this.edit.emit(value);
    this.closeDropdown();
  }
}
