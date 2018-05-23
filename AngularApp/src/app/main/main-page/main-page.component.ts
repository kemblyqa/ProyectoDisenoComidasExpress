import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerModel } from '../../models/manager.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit{
  manage:ManagerModel
  navItems:Array<any>
  ngOnInit() {
    
  }

  constructor(private router: Router) { 
    this.manage = new ManagerModel()
    this.navItems = this.manage.getNavItems()
  }

  goTo(path:any){
    this.router.navigate([`dashboard${path}`])
  }
}
