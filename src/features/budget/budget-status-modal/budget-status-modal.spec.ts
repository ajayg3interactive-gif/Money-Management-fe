import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetStatusModal } from './budget-status-modal';

describe('BudgetStatusModal', () => {
  let component: BudgetStatusModal;
  let fixture: ComponentFixture<BudgetStatusModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetStatusModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetStatusModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
