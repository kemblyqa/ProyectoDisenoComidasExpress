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
  constructor(private router:Router) { 
    this.manage = new ManagerModel()
    this.navItems = this.manage.getNavItems()
  }
  // goTo(){
  //   this.router.navigate(['/client'])
  // }
}
