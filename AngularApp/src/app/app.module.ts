import { HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http.service';
import { ManagerService } from './services/manager/manager.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ROUTES } from './app.routing';

import { AppComponent } from './app.component';
import { MenuRestaurantComponent } from './manager/menu-restaurant/menu-restaurant.component';
import { MenuClientComponent } from './client/menu-client/menu-client.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuRestaurantComponent,
    MenuClientComponent
  ],
  imports: [
    BrowserModule,
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
