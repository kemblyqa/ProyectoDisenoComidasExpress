import { MenuRestaurantComponent } from './manager/menu-restaurant/menu-restaurant.component';
import { Routes } from "@angular/router";

export const ROUTES: Routes = [
    {
        path: '', redirectTo: 'menu', pathMatch: 'full'
    },
    {
        path: 'menu', component: MenuRestaurantComponent
    },
    {
        path: '**', redirectTo: 'menu', pathMatch: 'full'
    }
]