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
  manage:ManagerModel
   //categories
  categories:Array<string>
  catSelected:any

  platillos$:Observable<Platillo[]>
  
  constructor(private router:Router, private managerService: ManagerService) { 
    this.manage = new ManagerModel()
    this.categories = this.manage.getCategories()
    this.managerService.getPlatillosRestaurant("")
    .subscribe(
      res => {
        if(res.status){
          this.platillos$ = res.data
          console.log(this.platillos$)
        }
      }
    )
  }
}
