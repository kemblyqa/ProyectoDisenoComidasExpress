import { AccountComponent } from './main/account/account.component';
import { PendingComponent } from './main/orders/pending/pending.component';
import { ApprovedComponent } from './main/orders/approved/approved.component';
import { OrdersComponent } from './main/orders/orders.component';
import { MainPageComponent } from './main/main-page/main-page.component';
import { MenuRestaurantComponent } from './main/menu-restaurant/menu-restaurant.component';
import { LoginComponent } from './main/login/login.component';
import { Routes } from '@angular/router';

export const ROUTES: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'dashboard', component: MainPageComponent,
        children: [
            {
                path: '', redirectTo: 'dashboard', pathMatch: 'full'
            },
            {
                path: 'menu', component: MenuRestaurantComponent
            },
            {
                path: 'pedidos', component: OrdersComponent,
                children: [
                    {
                        path: '', redirectTo: 'dashboard', pathMatch: 'full'
                    },
                    {
                        path: 'actuales', component: ApprovedComponent
                    },
                    {
                        path: 'pendientes', component: PendingComponent
                    }
                ]
            },
            {
                path: "cuenta", component: AccountComponent
            }
        ]
    },
    {
        path: '**', redirectTo: 'login', pathMatch: 'full'
    }
]
