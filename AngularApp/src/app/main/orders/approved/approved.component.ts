import { ManagerService } from './../../../services/manager/manager.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
  private manage:ManagerModel
  private headers:Array<any>
  private orders:Pedido[] = []
  /* pagination */
  private page:number = 1
  private totalPages:number
  /* gmaps api */
  lat: number = 10.362167730785652
  lng: number = -84.51030575767209
  
  constructor(private _managerService:ManagerService) {
    this.manage = new ManagerModel()
    this.headers = this.manage.getApprovedTableHeaders()
    this.getOrders()
  }
  updateApprovedPagination(e){
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
  /* get approved orders */
  getOrders(){
    this._managerService.getCustomOrders("keyAuto","aprobado")
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
  /* finish orders */
  isFinished(id:any){
    this._managerService.changeStatus(id, ["finalizado",""])
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
