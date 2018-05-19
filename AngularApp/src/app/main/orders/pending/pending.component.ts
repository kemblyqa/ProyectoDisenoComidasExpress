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
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "rest4" 
  /* decline reasons */
  private declineReason:string
  /* headers */
  manage:ManagerModel
  headers:Array<any>
  orders:Pedido
  page = 1;total = 13 * 10
  constructor(private _managerService:ManagerService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getPendingTableHeaders()
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
  modalDeclineOrder(){
    $("#modalDecline").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* get pending orders */
  getOrders(){
    this._managerService.getPendingOrders("keyAuto")
    .subscribe(
      success => {
        if(success.status){
          this.orders = success.data
        } else {
          this.failedMessageModal(success.data)
        }
      }
    )
  }
  /* declines order */
  declineOrder(){
    //declines order
    //refresh order list
  }
  approveOrder(){
    //approves order
    //refresh order list
  }
}
