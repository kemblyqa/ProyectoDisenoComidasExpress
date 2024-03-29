import { ManagerService } from './../../../services/manager/manager.service';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ManagerModel } from '../../../models/manager.model';
import { Pedido } from '../../../models/manager';
import { AgmMap } from '@agm/core';
import { Router } from '@angular/router';
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
  /* storage */
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
  { email: '',
    photoURL: '../../assets/icons/profile.png',
    displayName: '',
    restaurantes: [],
    nombre: '',
    telefono: ''};
    private defaultRestaurant: {id, name} = {id: "",name:""}
  constructor(private _managerService:ManagerService, private _router:Router) {
    this.user = JSON.parse(sessionStorage.getItem('user'))
    if (this.user === null) {
      this._router.navigate(['login']);
    }
    this.defaultRestaurant = JSON.parse(sessionStorage.getItem('currentRestaurant'))
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
    $("#modalApprovedSuccess").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* failed success! */
  failedMessageModal(message:any){
    this.failedMessage = message
    $("#modalApprovedFailed").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* open map modal */
  openMapModal(lat:any, lng:any){
    this.lat = lat
    this.lng = lng
    $("#modalApprovedMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* get approved orders */
  getOrders(){
    this._managerService.getCustomOrders(this.defaultRestaurant.id,"aprobado")
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
    console.log(id)
    this._managerService.approveStatus(id, "finalizado")
    .subscribe(
      success => {
        success.status ? this.successMessageModal(success.data) : this.failedMessageModal(success.data)
        this.getOrders()
      }
    )
  }
}
