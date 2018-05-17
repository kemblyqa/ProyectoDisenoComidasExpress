import { ManagerService } from './../../../services/manager/manager.service';
import { Component, OnInit } from '@angular/core';
import { ManagerModel } from '../../../models/manager.model';
import { Pedido } from '../../../models/manager';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.css']
})
export class ApprovedComponent {
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "rest4" 
  /* headers */
  manage:ManagerModel
  headers:Array<any>
  orders:Pedido
  constructor(private _managerService:ManagerService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getTableHeaders()
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
  getOrders(){
    this._managerService.getAllOrders("keyAuto")
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
}
