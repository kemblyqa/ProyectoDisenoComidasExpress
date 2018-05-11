import { Observable } from 'rxjs/Observable';
import { Platillo, ManagerInterface } from './../../models/manager.interface';
import { ManagerService } from './../../services/manager/manager.service';
import { ManagerModel } from '../../models/manager.model';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-menu-restaurant',
  templateUrl: './menu-restaurant.component.html',
  styleUrls: ['./menu-restaurant.component.css']
})
export class MenuRestaurantComponent{
  /* restaurante id y nombre */ 
  private restName:string = "Soda El Mercadito" 
  private restId:string = "rest4" 
  /* categories */
  private categories:Array<any> 
  private catSelected:any 
  private page:any = 1 
  /* edit platillo */ 
  private descriptionPlate:any 
  private pricePlate:any 
  private namePlate:any 
  private imagePlate:any 
  private categoryPlate:any 
  /* platillos observable */
  private platillos$:Observable<Platillo[]> 
  constructor(private _router:Router, private _managerService:ManagerService) {
    this.initCategories() 
  }
  /* inits categories to show platillos */
  initCategories(){
    this._managerService.getPlatillosByCategory(this.catSelected, this.page, this.restId) 
    .subscribe( 
      res => { 
        if(res.status){ 
          console.log(res.data) 
          this.platillos$ = res.data 
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
  /* modal edit platillo */
  editPlat(plat:Platillo){ 
    this.descriptionPlate = plat.descripcion 
    this.namePlate = plat.nombre 
    this.pricePlate = plat.precio 
    this.imagePlate = plat.imagen 
    this.categoryPlate = this.catSelected 
    $("#modalEditFood").modal('show');
  }

  updatePlat(){ 
     
  } 
}