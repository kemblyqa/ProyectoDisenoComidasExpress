import { ManagerModel } from './../../models/manager.model';
import { Router } from '@angular/router';
import { ManagerService } from './../../services/manager/manager.service';
import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/manager';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  /* models */
  private manage:ManagerModel
  /* modal messages */
  private failedMessage:any
  /* headers */
  private orderItems:Array<any>
  private orderOpts:Array<any>
  private declinedHeaders:Array<any>
  private expiredHeaders:Array<any>
  /* row lists */
  private expiredOrders:Pedido
  private declinedOrders:Pedido
  private historyOrders:Pedido
  /* pagination */
  private page:number = 1
  private totalPages:number = 0
  private restName:string = "Soda el Mercadito"
  constructor(private _managerService: ManagerService, private _router: Router) {
    this.manage = new ManagerModel()
    this.orderItems = this.manage.getOrderItems()
    this.orderOpts = this.manage.getOrderOptions()
    //table headers
    this.declinedHeaders = this.manage.getDeclinedTableHeaders()
    this.expiredHeaders = this.manage.getExpiredTableHeaders()
  }
  /* pagination */
  updateExpiredPagination(){
    this.getExpiredOrders()
  }
  updateDeclinedPagination(){
    this.getDeclinedOrders()
  }
  updateHistoryPagination(){
    this.getHistoryOrders()
  }
  /* failed success! */
  failedMessageModal(message:any){
    this.failedMessage = message
    $("#modalFailed").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* expired orders modal */
  expiredOrdersModal(){
    this.getExpiredOrders()
    $("#modalExpired").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* expired orders modal */
  declinedOrdersModal(){
    this.getDeclinedOrders()
    $("#modalDeclined").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* expired orders modal */
  historyOrdersModal(){
    this.getHistoryOrders()
    $("#modalHistory").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* other options */
  otherOptions(opt:number){
    switch(opt){
      case 1:
        this.expiredOrdersModal()
        break
      case 2:
        this.declinedOrdersModal()
        break
      case 3:
        this.historyOrdersModal()
        break
    }
  }
  /* get expired orders */
  getExpiredOrders(){
    this._managerService.getCustomOrders("keyAuto","expirado")
    .subscribe(
      success => {
        if(success.status){
          this.expiredOrders = success.data[0]
          this.totalPages = success.data[1] * 10
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* get declined orders */
  getDeclinedOrders(){
    this._managerService.getCustomOrders("keyAuto","rechazado")
    .subscribe(
      success => {
        if(success.status){
          this.declinedOrders = success.data[0]
          this.totalPages = success.data[1] * 10
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* get expired orders */
  getHistoryOrders(){
    this._managerService.getCustomOrders("keyAuto","finalizado")
    .subscribe(
      success => {
        if(success.status){
          this.historyOrders = success.data[0]
          this.totalPages = success.data[1] * 10
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  goTo(path:any){
    this._router.navigate([`dashboard/pedidos${path}`])
  }
}