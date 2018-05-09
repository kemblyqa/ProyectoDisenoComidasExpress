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

@NgModule({
  declarations: [
    AppComponent,
    MenuRestaurantComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule
  ],
  providers: [
    ManagerService  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
