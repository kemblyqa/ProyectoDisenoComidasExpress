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
  objectKeys = Object.keys;
  /* restaurant properties */
  private restId:string
  private restName:string
  private restCompany:string
  private restDescription:string
  private restLocation:Array<any> = [10.362167730785652,-84.51030575767209]
  private week:Array<any> = []
  private restSchedule:any
  private restImage:any
  private restaurants:Restaurante[]
  private restaurantsKeys:Array<any>
  private listScheduleShow:Array<any> = []
  /* model */
  private restTableHeaders:Array<any>
  private manage:ManagerModel
  private weekDays:Array<any> = [{id:"l",day:"Lunes"},{id:"k",day:"Martes"},{id:"m",day:"Miércoles"},{id:"j",day:"Jueves"},{id:"v",day:"Viernes"},{id:"s",day:"Sábado"},{id:"d",day:"Domingo"}]
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* pagination */
  private totalPages:number = 0
  private page:number = 1
  /* image */
  imgOpt:boolean = true
  isImgOptsCollapsed:boolean = false
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
    { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};

  constructor(private _managerService: ManagerService) {
    this.manage = new ManagerModel()
    this.restTableHeaders = this.manage.getRestaurantsTableHeaders()
    this.week = this.manage.cleanWeek()
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
    $('.collapse').collapse()
  }
  /* modal edit restaurant */
  editRestaurantModal(rest: Restaurante){
    this.isImgOptsCollapsed = true
    this.week = this.manage.cleanWeek()
    this.restName = rest.nombre
    this.restDescription = rest.descripcion
    this.restCompany = rest.empresa
    this.restLocation = [rest.ubicacion._latitude,rest.ubicacion._longitude]
    this.restSchedule = rest.horario
    this.week = this.manage.updateWeek(this.restSchedule)
    //image
    $("#modalModRest").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
    $('.collapse').collapse()
  }

  /* see the restaurant schedule */
  showSchedule(schedule:any){
    this.listScheduleShow = []
    for(var x = 0; x < this.weekDays.length; x++){
      for(let day in schedule){
        if(this.weekDays[x]["id"] == day && schedule[day].length > 0){
          let initHour = this.meridian(schedule[day][0].init)
          let endHour = this.meridian(schedule[day][0].end)
          this.listScheduleShow.push({
            day: this.weekDays[x]["day"],
            begin: {
              hour: initHour[0],
              min: initHour[1],
              meridian: initHour[2]
            },
            finish: {
              hour: endHour[0],
              min: endHour[1],
              meridian: endHour[2]
            }
          })
        }
      }
    }
    return this.listScheduleShow
  }
  meridian(minutes:number){
    let hour = Math.trunc(minutes/60)
    let minute = ((minutes%60) >= 0 && (minutes%60) < 10) ? "0"+(minutes%60) : minutes%60
    let meridian = ""
    if(hour > 12){
      hour -= 12
      meridian = "PM"
    } else {
      meridian = "AM"
    }
    return [hour,minute,meridian]
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
  /* modify restaurant */
  modifyRestaurant(){

  }
  /* open setUser modal */
  openSetUserModal() {
    $('#setUser').modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
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
  modifyUser() {
    this._managerService.setUser(this.user.email, this.user.nombre, this.user.telefono, undefined, true)
    .subscribe(res => {
      if (res.status) {
        this.successMessageModal(res.data);
      } else {
        this.failedMessageModal(res.data);
      }
    })
  }
  markPosition(e){
    this.restLocation[0]= e.coords.lat;
    this.restLocation[1]= e.coords.lng;
  }
  /* to get the base 64 encoded image*/
  onFileChange(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0]
      reader.readAsDataURL(file)
      reader.onload = () => { this.restImage = reader.result }
    }
  }
  switchImg(){
    this.restImage = null
  }
}
