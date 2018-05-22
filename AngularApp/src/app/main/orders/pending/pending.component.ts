import { Component, OnInit } from '@angular/core';
import { ManagerModel } from '../../../models/manager.model';
import { Pedido } from '../../../models/manager';
import { ManagerService } from '../../../services/manager/manager.service';
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
  private restId:string = "rest4" 
  /* decline reasons */
  private declineReason:string
  /* headers */
  private manage:ManagerModel
  private headers:Array<any>
  private orders:Pedido
  /* pagination */
  private page:number = 1
  private totalPages:number = 0
  constructor(private _managerService:ManagerService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getPendingTableHeaders()
    this.getOrders()
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
    this._managerService.changeStatus(this.declineOrderId, "rechazado")//falta motivo
    .subscribe(
      success => {
        if(success.status){
          this.successMessageModal(success.data)
          this.getOrders()
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* approves order */
  approveOrder(id:any){
    console.log(id)
    this._managerService.changeStatus(id, "aprobado")
    .subscribe(
      success => {
        if(success.status){
          this.successMessageModal(success.data)
          this.getOrders()
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
}
