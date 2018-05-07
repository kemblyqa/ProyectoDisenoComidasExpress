import { Platillo } from './../../models/manager.interface';
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
  navItems:Array<any>
  platillos:Array<Platillo>
  
  constructor(private router:Router, private managerService: ManagerService) { 
    this.manage = new ManagerModel()
    this.navItems = this.manage.getNavItems()
    this.platillos = this.manage.getPlatillos()
    this.managerService.getCategories()
  }
  // goTo(){
  //   this.router.navigate(['/client'])
  // }
}
