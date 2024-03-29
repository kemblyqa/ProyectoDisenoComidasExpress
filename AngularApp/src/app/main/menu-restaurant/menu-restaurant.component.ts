import { Observable } from 'rxjs/Observable';
import { Platillo, StatusData } from './../../models/manager';
import { ManagerService } from './../../services/manager/manager.service';
import { ManagerModel } from '../../models/manager.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-menu-restaurant',
  templateUrl: './menu-restaurant.component.html',
  styleUrls: ['./menu-restaurant.component.css']
})
export class MenuRestaurantComponent implements OnInit {
  /* modal messages */
  private successMessage:any
  private failedMessage:any
  /* restaurante id y nombre */
  private restName:string = "Soda El Mercadito"
  /* categories */
  private categories:Array<any>
  private catSelected:any
  private newCat:boolean
  private modCat:boolean
  /* edit platillo */
  private descriptionPlate:any
  private pricePlate:number
  private namePlate:any
  private imagePlate:any
  private allCategories:Array<any>
  private categoryPlate:any
  /* rating */
  private starsList:Boolean[]
  private keyUsersRatingList:Array<any> =[]
  private ratingList:Array<any>
  private revClient:any
  private starsClient:any 
  // private pageRate:number
  // private totalPagesRate:number
  /* platillos observable */
  private platillos:Platillo[] = []
  private currentPlate:Platillo
  private manage:ManagerModel
  private headers:Array<any>
  /* pagination */
  private totalPages:number = 0
  private page:number = 1
  /* image */
  imgOpt:boolean = true
  isCollapsed:boolean = true
  /* storage */
  private user: {email, photoURL, displayName, restaurantes, nombre, telefono} =
    { email: '',
      photoURL: '../../assets/icons/profile.png',
      displayName: '',
      restaurantes: [],
      nombre: '',
      telefono: ''};
  private defaultRestaurant: {id, name} = {id: '',name:''}
  constructor(private _router:Router, private _managerService:ManagerService) {
    // storage to keep in
    this.user = JSON.parse(sessionStorage.getItem('user'))
    if (this.user === null) {
      this._router.navigate(['login']);
    }
    this.defaultRestaurant = JSON.parse(sessionStorage.getItem('currentRestaurant'))
    // models
    this.manage = new ManagerModel()
    this.headers = this.manage.getRatingTableHeaders()
    this.starsList = [true, true, true, true, true]
  }
  ngOnInit(){
    this.initCustomCategories()
    this.initAllCategories()
  }
  /* update all info */
  update(){
    this.initCustomCategories()
    this.initAllCategories()
    this.updateMenu()
  }
  /* switch cleans category var */
  switchCat(){
    this.categoryPlate = null
  }
  switchImg(){
    this.imagePlate = null
  }
  /* inits categories to show platillos */
  initCustomCategories(){
    this._managerService.getRestCategories(this.defaultRestaurant.id)
    .subscribe(
      res => {
        res.status ? this.categories = res.data : this.failedMessageModal(res.data)
      }
    )
  }
  /* inits all categories */
  initAllCategories(){
    this._managerService.getAllCategories()
    .subscribe(
      res => {
        res.status ? this.allCategories = res.data : this.failedMessageModal(res.data)
      }
    )
  }
  /* updates menu */
  updateMenu(){
    this._managerService.getPlatillosByCategory(this.catSelected, this.page, this.defaultRestaurant.id)
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
    this.update()
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
    $('#modalFailed').modal({
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
    this.categoryPlate = this.catSelected
    $("#modalCreateFood").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* modal edit platillo */
  editPlatModal(plat:Platillo){
    this.isCollapsed = true
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
/* deletes plate */
  delPlatModal(plat:Platillo){
    this.currentPlate = plat
    $("#modalDelFood").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
  /* see the review */
  ratePlateModal(plat:Platillo){
    this.ratingList = plat.calificaciones
    this.keyUsersRatingList = Object.keys(plat.calificaciones)
    $("#modalRating").modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    })
  }
 /* creates plate */
  createPlat(){
    this._managerService.addPlatillo(
      this.namePlate,
      this.descriptionPlate,
      this.pricePlate,
      this.categoryPlate,
      this.defaultRestaurant.id
    ).subscribe(
      success=>{
        success.status ? this.successMessageModal("Se ha creado el nuevo platillo correctamente.") : this.failedMessageModal(success.data)
        this.update()
      }
    )
  }
/* to get the base 64 encoded image*/
  onFileChange(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0]
      reader.readAsDataURL(file)
      reader.onload = () => { this.imagePlate = reader.result }
    }
  }
  /* stars rating list */
  setStars(stars: number){
    for(var i=0;i<=4;i++){
      stars <= i ? this.starsList[i] = true : this.starsList[i] = false;
    }
    return true;
  }
  /* updates platillo */
  updatePlat(){
    this._managerService.modPlatillo(
      this.namePlate,
      this.descriptionPlate,
      this.pricePlate,
      this.categoryPlate,
      this.defaultRestaurant.id,
      this.currentPlate.id
    ).subscribe(
      success=>{
        success.status ? this.updateImage() : this.failedMessageModal(success.data)
        this.update()
      }
    )
  }
  /* updates platillo image*/
  updateImage(){
    if(!this.isCollapsed){
      if(this.imgOpt){//if upload image
        this._managerService.uploadBase64ImagePlatillo(this.currentPlate.id,this.imagePlate)
        .subscribe(
          success=>{
            success.status ? this.successMessageModal("Se ha actualizado el platillo correctamente.") : this.failedMessageModal(success.data)
            this.update()
          }
        )
      } else {//image url
        this._managerService.uploadUrlImagePlatillo(this.currentPlate.id,this.imagePlate)
        .subscribe(
          success=>{
            success.status ? this.successMessageModal("Se ha actualizado el platillo correctamente.") : this.failedMessageModal(success.data)
            this.update()
          }
        )
      }
    } else {
      this.successMessageModal("Se ha actualizado el platillo correctamente.")
    }
  }
  /* deletes platiilo */
  deletePlat(){
    this._managerService.delPlatillo(this.currentPlate.nombre, this.defaultRestaurant.id)
    .subscribe(
      success=>{
        success.status ? this.successMessageModal("Se ha eliminado el platillo correctamente.") : this.failedMessageModal(success.data)
        this.update()
      }
    )
  }
  /* get platillo object from list by id */
  getIdPlatillo(obj:Platillo):Platillo {
    return this.platillos.find(plate => plate.id == obj.id)
  }
}
