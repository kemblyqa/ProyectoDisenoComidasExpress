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
  private restaurants:Array<any> = []
  /* init interface */
  private currentRest : Restaurante = {
    keyRest: "",
    descripcion: "",
    nombre: "fff",
    empresa:"",
    ubicacion: {
        _latitude: 0,
        _longitude: 0
    },
    horario: ""
  } as Restaurante

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
  /* modal edit profile */
  editProfileModal(rest: Restaurante){
    this.currentRest = rest
    $("#modalEdit").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }

  getRestaurants(){

  }
}
