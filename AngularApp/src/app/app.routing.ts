import { PendingComponent } from './main/orders/pending/pending.component';
import { ApprovedComponent } from './main/orders/approved/approved.component';
import { OrdersComponent } from './main/orders/orders.component';
import { MainPageComponent } from './main/main-page/main-page.component';
import { MenuRestaurantComponent } from './main/menu-restaurant/menu-restaurant.component';
import { Routes } from "@angular/router";

export const ROUTES: Routes = [
    {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
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
            }
        ]
    },
    {
        path: '**', redirectTo: 'dashboard', pathMatch: 'full'
    }
]