import { Observable } from 'rxjs/Observable';
import { Platillo, Category, ManagerInterface } from './../../models/manager.interface';
import { ManagerService } from './../../services/manager/manager.service';
import { ManagerModel } from '../../models/manager.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-restaurant',
  templateUrl: './menu-restaurant.component.html',
  styleUrls: ['./menu-restaurant.component.css']
})
export class MenuRestaurantComponent{
  /* categories */
  categories:Array<any>
  catSelected:any
  /* platillos observable */
  platillos$:Observable<Platillo[]>
  constructor(private _router:Router, private _managerService:ManagerService) {
    this.initCategories() 
  }
  /* inits categories to show platillos */
  initCategories(){
    this._managerService.getCategories()
    .subscribe(
      res => {
        if(res.status){
          this.categories = res.data
        }
      }
    )
  }
  /* updates menu */
  updateMenu(){
    this._managerService.getPlatillosRestaurant(this.catSelected)
    .subscribe(
      res => {
        if(res.status){
          this.platillos$ = res.data
        }
      }
    )
  }
}
