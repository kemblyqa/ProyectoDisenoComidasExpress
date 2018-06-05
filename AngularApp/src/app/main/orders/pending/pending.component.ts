import { ExpireOrderService } from './../../../services/orders/orders.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ManagerModel } from '../../../models/manager.model';
import { Pedido } from '../../../models/manager';
import { ManagerService } from '../../../services/manager/manager.service';
import { AgmMap } from '@agm/core';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent {
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  private declineOrderId:any
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "NYJdrAl83G9dNWpF6z4J" 
  /* decline reasons */
  private declineReason:string
  /* headers */
  private manage:ManagerModel
  private headers:Array<any>
  private orders:Pedido[]
  /* pagination */
  private page:number = 1
  private totalPages:number = 0
  /* gmaps api */
  lat: number = 10.362167730785652
  lng: number = -84.51030575767209
  /* interval */
  private ordersInterval:any
  constructor(private _managerService:ManagerService, private _pendingOrders: ExpireOrderService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getPendingTableHeaders()
    this.getOrders()
  }
  ngOnInit(){
    this.ordersInterval = setInterval(()=>{
      this.getOrders()
    },3000)
  }
  ngOnDestroy(){
    clearInterval(this.ordersInterval)
  }
  /* open map modal */
  openMapModal(lat:any, lng:any){
    this.lat = lat
    this.lng = lng
    $("#modalMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* pagination */
  updatePendingPagination(e){
    this.page = e
    this.getOrders()
  }
  /* modal success! */
  successMessageModal(message:any){
    this.successMessage = message
    $("#modalSuccess").modal({
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
  /* modal decline order reason */
  modalDeclineOrder(id:any){
    this.declineOrderId = id
    $("#modalDecline").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* get pending orders */
  getOrders(){
    this._managerService.getCustomOrders("keyAuto","pendiente")
    .subscribe(
      success => {
        if(success.status){
          this.orders = success.data[0]
          this.totalPages = success.data[1] * 10
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* declines order */
  declineOrder(){
    this._managerService.declineStatus(this.declineOrderId, "rechazado", this.declineReason)//falta motivo
    .subscribe(
      success => {
        success.status ? this.successMessageModal(success.data):this.failedMessageModal(success.data)
        this.getOrders()
      }
    )
  }
  /* approves order */
  approveOrder(id:any){
    console.log(id)
    this._managerService.approveStatus(id, "aprobado")
    .subscribe(
      success => {
        success.status ? this.successMessageModal(success.data):this.failedMessageModal(success.data)
        this.getOrders()
      }
    )
  }
}
