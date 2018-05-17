import { ManagerModel } from './../../models/manager.model';
import { Router } from '@angular/router';
import { ManagerService } from './../../services/manager/manager.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  manage:ManagerModel
  orderItems:Array<any>
  restName:string = "Soda el Mercadito"
  constructor(private _managerService: ManagerService, private _router: Router) {
    this.manage = new ManagerModel()
    this.orderItems = this.manage.getOrderItems()
  }
  goTo(path:any){
    this._router.navigate([`dashboard/pedidos${path}`])
  }
}