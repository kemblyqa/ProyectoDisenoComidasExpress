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
  /* models and nav items */
  manage: ManagerModel;
  navItems: Array<any>;
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
    { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};
  ngOnInit() {}
  constructor(private router: Router) {
    this.user = JSON.parse(sessionStorage.getItem('user'))
    if (this.user === null) {
      this.router.navigate(['login']);
    }
    this.manage = new ManagerModel();
    this.navItems = this.manage.getNavItems();
  }

  goTo(path: any) {
    this.router.navigate([`dashboard${path}`]);
  }
}
