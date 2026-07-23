import { Routes } from '@angular/router';
import { Dashboard } from '../features/dashboard/dashboard/dashboard';
import { Transactions } from '../features/transactions/transactions/transactions';
import { Plan } from '../features/plan/plan/plan';
import { Budget } from '../features/budget/budget/budget';
import { Login } from '../features/auth/login/login';
import { Signup } from '../features/auth/signup/signup';
import { authGuard } from '../core/guards/auth.guard';
import { guestGuard } from '../core/guards/guest.guard';

export const routes: Routes = [
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'signup', component: Signup, canActivate: [guestGuard] },
    { path: '', component: Dashboard, canActivate: [authGuard] },
    { path: 'transaction', component: Transactions, canActivate: [authGuard] },
    { path: 'plan', component: Plan, canActivate: [authGuard] },
    { path: 'budget', component: Budget, canActivate: [authGuard] },
];
