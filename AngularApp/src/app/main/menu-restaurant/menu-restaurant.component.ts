import { Observable } from 'rxjs/Observable';
import { Platillo, StatusData } from './../../models/manager';
import { ManagerService } from './../../services/manager/manager.service';
import { ManagerModel } from '../../models/manager.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-menu-restaurant',
  templateUrl: './menu-restaurant.component.html',
  styleUrls: ['./menu-restaurant.component.css']
})
export class MenuRestaurantComponent{
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "rest4" 
  /* categories */
  private categories:Array<any> 
  private catSelected:any 
  /* edit platillo */ 
  private descriptionPlate:any 
  private pricePlate:number 
  private namePlate:any 
  private imagePlate:any 
  private allCategories:Array<any>
  private categoryPlate:any 
  /* platillos observable */
  private platillos:Platillo[] = []
  private currentPlate:Platillo
  /* pagination */
  private totalPages:number
  private page:number = 1
  constructor(private _router:Router, private _managerService:ManagerService) {
    this.initCustomCategories() 
    this.initAllCategories()
    this.totalPages = 0 
  } 
  /* inits categories to show platillos */ 
  initCustomCategories(){ 
    this._managerService.getRestCategories(this.restId) 
    .subscribe( 
      res => { 
        if(res.status){ 
          this.categories = res.data 
        }
        else 
          this.failedMessageModal(res.data)
      } 
    ) 
  }
  /* inits all categories */
  initAllCategories(){
    this._managerService.getAllCategories()
    .subscribe(
      res => {
        if(res.status){
          this.allCategories = res.data
        }
        else 
          this.failedMessageModal(res.data)
      }
    )
  } 
  /* updates menu */
  updateMenu(){
    this._managerService.getPlatillosByCategory(this.catSelected, this.page, this.restId) 
    .subscribe(
      res => {
        if(res.status){
          this.platillos = res.data[0]
          this.totalPages = res.data[1] * 10
        }
        else 
          this.failedMessageModal(res.data)
      }
    )
  }
  /* pagination update */
  updatePlatesPagination(e){
    this.page = e
    this.updateMenu()
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
  /* modal create new platillo */
  addPlatModal(){
    this.descriptionPlate = "" 
    this.namePlate = "" 
    this.pricePlate = null 
    this.imagePlate = "" 
    this.categoryPlate = this.catSelected 
    $("#modalCreateFood").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* modal edit platillo */
  editPlatModal(plat:Platillo){ 
    this.descriptionPlate = plat.descripcion 
    this.namePlate = plat.nombre 
    this.pricePlate = plat.precio 
    this.imagePlate = plat.imagen 
    this.categoryPlate = this.catSelected
    this.currentPlate = this.getIdPlatillo(plat) 
    $("#modalEditFood").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }

  delPlatModal(plat:Platillo){
    this.currentPlate = plat
    $("#modalDelFood").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }

  createPlat(){
    this._managerService.addPlatillo(
      this.namePlate,
      this.descriptionPlate,
      this.pricePlate,
      this.categoryPlate,
      this.restId,
      this.imagePlate  
    ).subscribe(
      success=>{
        if(success.status){
          this.successMessageModal("Se ha creado el nuevo platillo correctamente.")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  }

  updatePlat(){ 
    this._managerService.modPlatillo(
      this.namePlate,
      this.descriptionPlate,
      this.pricePlate,
      this.categoryPlate,
      this.restId,
      this.imagePlate,
      this.currentPlate.id
    ).subscribe(
      success=>{
        if(success.status){
          this.successMessageModal("Se ha actualizado el platillo correctamente.")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  } 

  deletePlat(){
    this._managerService.delPlatillo(this.currentPlate.nombre, this.restId)
    .subscribe(
      success=>{
        if(success.status){
          this.successMessageModal("Se ha eliminado el platillo correctamente.")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  }
  getIdPlatillo(obj:Platillo):Platillo {
    return this.platillos.find(plate => plate.id == obj.id)
  }
}