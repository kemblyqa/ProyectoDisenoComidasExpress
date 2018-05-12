import { Observable } from 'rxjs/Observable';
import { Platillo, StatusData } from './../../models/manager.interface';
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
  private page:any = 1 
  /* edit platillo */ 
  private descriptionPlate:any 
  private pricePlate:number 
  private namePlate:any 
  private imagePlate:any 
  private allCategories:Array<any>
  private categoryPlate:any 
  /* platillos observable */
  private platillos$:Platillo[]
  constructor(private _router:Router, private _managerService:ManagerService) { 
    this.initCustomCategories() 
    this.initAllCategories() 
  } 
  /* inits categories to show platillos */ 
  initCustomCategories(){ 
    this._managerService.getRestCategories(this.restId) 
    .subscribe( 
      res => { 
        if(res.status){ 
          this.categories = res.data 
        } 
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
      }
    )
  } 
  /* updates menu */
  updateMenu(){
    this._managerService.getPlatillosByCategory(this.catSelected, this.page, this.restId) 
    .subscribe(
      res => {
        if(res.status){
          this.platillos$ = res.data
        }
      }
    )
  }
  /* modal success! */
  successMessageModal(message:any){
    this.successMessage = message
    $("#modalSuccess").modal("show")
  }
  /* failed success! */
  failedMessageModal(message:any){
    this.failedMessage = message
    $("#modalFailed").modal("show")
  }
  /* modal create new platillo */
  addPlatModal(){
    this.descriptionPlate = "" 
    this.namePlate = "" 
    this.pricePlate = 0 
    this.imagePlate = "" 
    this.categoryPlate = this.catSelected 
    $("#modalCreateFood").modal("show")
    $( "#modalCreateFoodCreate" ).click(()=> {
      this.createPlat(
        this.namePlate,
        this.descriptionPlate,
        this.pricePlate,
        this.categoryPlate,
        this.imagePlate
      )
    });
  }
  /* modal edit platillo */
  editPlatModal(plat:Platillo){ 
    this.descriptionPlate = plat.descripcion 
    this.namePlate = plat.nombre 
    this.pricePlate = plat.precio 
    this.imagePlate = plat.imagen 
    this.categoryPlate = this.catSelected 
    $("#modalEditFood").modal("show")
    $( "#modalEditFoodSaveChanges" ).click(()=> {
      this.updatePlat(
        this.namePlate,
        this.descriptionPlate,
        this.pricePlate,
        this.categoryPlate,
        this.imagePlate
      )
    });
  }

  delPlatModal(plat:Platillo){
    $("#modalDelFood").modal("show")
    $( "#modalDelFoodSaveChanges" ).click(()=> {
      this.deletePlat(plat)
    });
  }

  createPlat(namePlate:any,descriptionPlate:any,pricePlate:number,categoryPlate:any,imagePlate:any){
    this._managerService.addPlatillo(
      namePlate,
      descriptionPlate,
      pricePlate,
      categoryPlate,
      this.restId,
      imagePlate
    ).subscribe(
      success=>{
        if(success.status){
          this.successMessageModal("Exito")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  }

  updatePlat(namePlate:any,descriptionPlate:any,pricePlate:number,categoryPlate:any,imagePlate:any){ 
     this._managerService.modPlatillo(
      namePlate,
      descriptionPlate,
      pricePlate,
      categoryPlate,
      this.restId,
      imagePlate
    ).subscribe(
      success=>{
        if(success.status){
          console.log(JSON.stringify(success))
          this.successMessageModal("Exito")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  } 

  deletePlat(plat:Platillo){
    this._managerService.delPlatillo(plat.nombre, this.restId)
    .subscribe(
      success=>{
        if(success.status){
          console.log(JSON.stringify(success))
          this.successMessageModal("Exito")
          this.updateMenu()
        } 
        else 
          this.failedMessageModal(success.data)
      }
    )
  }
}