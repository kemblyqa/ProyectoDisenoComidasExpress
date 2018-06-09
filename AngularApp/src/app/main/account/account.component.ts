import { Restaurante } from './../../models/manager';
import { Component, OnInit } from '@angular/core';
import { ManagerModel } from '../../models/manager.model';
import { AgmMap } from '@agm/core';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  /* restaurant properties */
  private restId:string
  private restName:string
  private restCompany:string
  private restDescription:string
  private restLocation:Array<any> = [0,0]
  private restSchedule:any
  private restImage:any
  private restaurants:Array<any> = []
  /* model */
  private headers:Array<any>
  private manage:ManagerModel
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* pagination */
  private totalPages:number = 0 
  private page:number = 1

  constructor() {
    this.manage = new ManagerModel()
    this.headers = this.manage.getRestaurantsTableHeaders()
  }
  ngOnInit() {}

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
  /* modal add restaurant */
  addRestaurantModal(){
    this.restName = ""
    this.restDescription = ""
    this.restCompany = ""
    this.restLocation[0] = 0
    this.restLocation[1] = 0
    this.restSchedule = null
    $("#modalAddRest").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* modal edit restaurant */
  editRestaurantModal(rest: Restaurante){
    this.restName = rest.nombre
    this.restDescription = rest.descripcion
    this.restCompany = rest.empresa
    this.restLocation[0] = rest.ubicacion._latitude
    this.restLocation[1] = rest.ubicacion._longitude
    this.restSchedule = rest.horario
    $("#modalEditRest").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }

  getRestaurants(){

  }
  /* schedule modal */
  openScheduleModal(){
    $("#modalAddSchedule").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  saveSchedule(){

  }
  /* open map modal */
  openMapModal(lat:any, lng:any){
    this.restLocation[0] = lat
    this.restLocation[1] = lng
    $("#modalRestMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  markPosition(e){
    this.restLocation[0]= e.coords.lat;
    this.restLocation[1]= e.coords.lng;
    console.log(this.restLocation)
  }
  savePosition(){

  }
}
