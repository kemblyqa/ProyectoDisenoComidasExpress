import { Restaurante } from './../../models/manager';
import { Component, OnInit } from '@angular/core';
import { ManagerModel } from '../../models/manager.model';
import { AgmMap } from '@agm/core';
import { ManagerService } from '../../services/manager/manager.service';
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
  private restLocation:Array<any> = [10.362167730785652,-84.51030575767209]
  private week:Array<any>
  private restSchedule:any
  private restImage:any
  private restaurants:Restaurante[]
  private restaurantsKeys:Array<any>
  /* model */
  private restTableHeaders:Array<any>
  private manage:ManagerModel
  private user:any
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* pagination */
  private totalPages:number = 0 
  private page:number = 1

  constructor(private _managerService: ManagerService) {
    this.manage = new ManagerModel()
    this.restTableHeaders = this.manage.getRestaurantsTableHeaders()
    console.log(this.restTableHeaders)
    this.week = this.manage.getWeek()
    this.user = JSON.parse(sessionStorage.getItem('user'))
    this.getRestaurants()
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
    this.week = this.manage.cleanWeek()
    this.restName = undefined
    this.restDescription = undefined
    this.restCompany = undefined
    this.restLocation = [10.362167730785652,-84.51030575767209]
    this.restSchedule = {"l":[],"k":[],"m":[],"j":[],"v":[],"s":[],"d":[]}
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
    $("#modalModRest").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }

  /* see the restaurant schedule */
  openScheduleModal(schedule:any){
    $("#modalModRest").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  getRestaurants(){
    this._managerService.getUserRestaurants(this.user.email)
    .subscribe(
      success =>{
        if(success.status){
          this.restaurantsKeys = Object.keys(success.data)
          this.restaurants = success.data
        }
      }
    )
  }
  /* check start hour be less than finish hour */
  verifyHours(day:any){
    if(day.checked){
      ((day.timeInit.hour * 60) + day.timeInit.minute) >= ((day.timeEnd.hour * 60) +  day.timeEnd.minute) 
      ? day.valid = false : day.valid = true
    }
  }
  saveSchedule(){
    for(let day of this.week){
      if(day.checked){
        this.restSchedule[day.id].push({
          "init": (day.timeInit.hour * 60) + day.timeInit.minute,
          "end": (day.timeEnd.hour * 60) +  day.timeEnd.minute
        })
      }
    }
  }
  /* add restaurant to server */
  addRestaurant(){
    this.saveSchedule()
    this._managerService.addRestaurant(this.restName, this.restCompany, this.restDescription, 
    this.restLocation, this.restSchedule, this.user.email)
    .subscribe(
      success => {
        success.status ? this.successMessageModal(success.data) : this.failedMessageModal(success.data)
      }
    )
  }
  /* open map modal */
  openMapModal(location:any){
    this.restLocation = [location._latitude, location._longitude]
    $("#modalRestLocMap").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  markPosition(e){
    this.restLocation[0]= e.coords.lat;
    this.restLocation[1]= e.coords.lng;
  }
  savePosition(){}
}
