import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentBalanceMenu } from './current-balance-menu';

describe('CurrentBalanceMenu', () => {
  let component: CurrentBalanceMenu;
  let fixture: ComponentFixture<CurrentBalanceMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentBalanceMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentBalanceMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
