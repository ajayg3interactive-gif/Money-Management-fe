import { Routes } from '@angular/router';
import { Dashboard } from '../features/dashboard/dashboard/dashboard';
import { Transactions } from '../features/transactions/transactions/transactions';

export const routes: Routes = [

    {path:'',component:Dashboard},
    {path:'transaction',component:Transactions},
    {path:'plan',component:Transactions}
];
