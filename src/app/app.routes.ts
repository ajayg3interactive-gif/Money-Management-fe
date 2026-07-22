import { Routes } from '@angular/router';
import { Dashboard } from '../features/dashboard/dashboard/dashboard';
import { Transactions } from '../features/transactions/transactions/transactions';
import { Login } from '../features/auth/login/login';
import { Signup } from '../features/auth/signup/signup';

export const routes: Routes = [

    {path:'login',component:Login},
    {path:'signup',component:Signup},
    {path:'',component:Dashboard},
    {path:'transaction',component:Transactions},
    {path:'plan',component:Transactions}
];
