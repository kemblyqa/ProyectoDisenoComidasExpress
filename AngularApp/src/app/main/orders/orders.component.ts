import { ManagerModel } from './../../models/manager.model';
import { Router } from '@angular/router';
import { ManagerService } from './../../services/manager/manager.service';
import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/manager';
import { AgmMap } from '@agm/core';
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
  private finishedHeaders:Array<any>
  /* row lists */
  private declinedOrders:Pedido
  private finishedOrders:Pedido
  /* pagination */
  private page:number = 1
  private totalPages:number = 0
  private restName:string = "Soda el Mercadito"
  /* gmaps api */
  lat: number = 10.362167730785652
  lng: number = -84.51030575767209
  
  constructor(private _managerService: ManagerService, private _router: Router) {
    this.manage = new ManagerModel()
    this.orderItems = this.manage.getOrderItems()
    this.orderOpts = this.manage.getOrderOptions()
    //table headers
    this.declinedHeaders = this.manage.getDeclinedTableHeaders()
    this.finishedHeaders = this.manage.getFinishedTableHeaders()
  }
  /* pagination */
  updateDeclinedPagination(e){
    this.page = e
    this.getDeclinedOrders()
  }
  updateFinishedPagination(e){
    this.page = e
    this.getFinishedOrders()
  }
  /* open map modal */
  openMapModal(lat:any, lng:any){
    this.lat = lat
    this.lng = lng
    $("#orderModalMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
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
  /* deleted orders modal */
  declinedOrdersModal(){
    this.getDeclinedOrders()
    $("#modalDeclined").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* finished orders modal */
  finishedOrdersModal(){
    this.getFinishedOrders()
    $("#modalFinished").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* other options */
  otherOptions(opt:number){
    switch(opt){
      case 1:
        this.finishedOrdersModal()
        break
      case 2:
        this.declinedOrdersModal()
        break
    }
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
  getFinishedOrders(){
    this._managerService.getCustomOrders("keyAuto","finalizado")
    .subscribe(
      success => {
        if(success.status){
          this.finishedOrders = success.data[0]
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