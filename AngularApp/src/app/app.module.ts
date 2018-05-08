import { ManagerModel } from './models/manager.model';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http.service';
import { ManagerService } from './services/manager/manager.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

import { RouterModule } from "@angular/router";
import { ROUTES } from './app.routing';

import { AppComponent } from './app.component';
import { MenuRestaurantComponent } from './manager/menu-restaurant/menu-restaurant.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuRestaurantComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule
  ],
  providers: [
    ManagerService,
    HttpService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
