import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerModel } from '../../models/manager.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  /* user */
  private user = 'Kembly Quirós';
  /* models and nav items */
  manage: ManagerModel;
  navItems: Array<any>;
  userInfo: any;
  ngOnInit() {}
  constructor(private router: Router) {
    this.userInfo = sessionStorage.getItem('user');
    if (this.userInfo === null) {
      this.router.navigate(['login']);
    } else {
      console.log(this.userInfo);
    }
    this.manage = new ManagerModel();
    this.navItems = this.manage.getNavItems();
  }

  goTo(path: any) {
    this.router.navigate([`dashboard${path}`]);
  }
}
