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
                path: 'menu', component: MenuRestaurantComponent
            },
            {
                path: '', redirectTo: 'dashboard', pathMatch: 'full'
            },
            {
                path: 'pedidos', component: OrdersComponent
            }
        ]
    },
    {
        path: '**', redirectTo: 'dashboard', pathMatch: 'full'
    }
]