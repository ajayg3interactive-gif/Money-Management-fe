import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-budget-status-modal',
  imports: [FormsModule],
  templateUrl: './budget-status-modal.html',
  styleUrl: './budget-status-modal.css',
})
export class BudgetStatusModal implements OnInit {

  private categoryService = inject(CategoryService);

  @Output() closemodal = new EventEmitter();

  amount = signal(0);
  category = signal("")
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  ngOnChanges(){
    //  this.amount.set(this.editData.amount);
  }

  closeModal() {
    this.closemodal.emit(false)
  }

}
