import { ManagerModel } from './models/manager.model';
import { HttpClientModule } from '@angular/common/http';
import { ManagerService } from './services/manager/manager.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

import { RouterModule } from "@angular/router";
import { ROUTES } from './app.routing';

import { AppComponent } from './app.component';
import { MenuRestaurantComponent } from './main/menu-restaurant/menu-restaurant.component';
import { MainPageComponent } from './main/main-page/main-page.component';
import { OrdersComponent } from './main/orders/orders.component';
import { ApprovedComponent } from './main/orders/approved/approved.component';
import { PendingComponent } from './main/orders/pending/pending.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent,
    MenuRestaurantComponent,
    MainPageComponent,
    OrdersComponent,
    ApprovedComponent,
    PendingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule,
    NgbModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDzOmASaIIJpYk_uAIVc3pv7BVjTZjhYvE"
    })
  ],
  providers: [
    ManagerService  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
