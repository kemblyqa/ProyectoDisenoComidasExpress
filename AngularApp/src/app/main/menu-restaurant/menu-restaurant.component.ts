import { Platillo, Category } from './../../models/manager.interface';
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
  platillos:Array<any>
  
  constructor(private router:Router, private managerService: ManagerService) { 
    this.manage = new ManagerModel()
    this.platillos = this.manage.getPlatillos()
    this.categories = this.manage.getCategories()
    this.managerService.getPlatillosRestaurant("")
  }
}
