import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { StatusData } from './../../models/manager';

//manager and restaurant endpoints
const ENDPOINT_GETCATEGORIES = "categoria"
const ENDPOINT_GETPLATILLOS = "GetPlatillosC"
const ENDPOINT_PLATILLOS_REST = "filtroPlat"
const ENDPOINT_ADDPLATILLO = "addPlatillo"
const ENDPOINT_MODPLATILLO = "modPlatillo"
const ENDPOINT_DELPLATILLO = "delPlatillo"
const ENDPOINT_ALLORDERS = "filtroPedidos"
const ENDPOINT_CHANGESTATUS = "setEstado"
const ENDPOINT_IMAGE_PLATILLO = "subirImagenPlat"
const ENDPOINT_IMAGE_RESTAURANT = "subirImagenRest"
const ENDPOINT_DELETE_EXPIRED = "limpiarPedidos"
const ENDPOINT_GET_USER = "getUser"
const ENDPOINT_ADDRESTAURANT = "addRestaurante"
const ENDPOINT_MODRESTAURANT = "modRestaurante"
const ENDPOINT_SET_USER = "setUsuario"
const ENDPOINT_GETRESTS = "getRests"
const ENDPOINT_ANDROID = "android"
@Injectable()
export class ManagerService {
    //url develop mode
    public apiUrl:string = "https://designexpresstec.firebaseapp.com/api/";
    //public apiUrl:string = "http://localhost:5000/api/";
    constructor(private _service: HttpClient){}

    /* get rest categories to show in menu */
    public getRestCategories(rest:any){
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_GETCATEGORIES}`,{
            params: {
                keyRest: rest
            }
        })
    }
    /* get all the categories to add a plate */
    public getAllCategories(){
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_GETCATEGORIES}`)
    }
    /* get plates by category selected */
    public getPlatillosByCategory(cat:any, page:any, restId: any) {
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_PLATILLOS_REST}`,
        {
            params: {
                categoria:cat,
                pagina:page,
                keyRest: restId
            }
        })
    }

    /* add a new plate */
    public addPlatillo(name:any, description:any, price:number, category: any, rest:string){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_ADDPLATILLO}`,{
            nombre: name,
            descripcion: description,
            precio: price,
            categoria: category,
            keyRest: rest
        })
    }
    /* edits a existing plate */
    public modPlatillo(name:any, description:any, price:number, category: any, rest:string, id:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_MODPLATILLO}`,{
            nombre: name,
            descripcion: description,
            precio: price,
            categoria: category,
            keyRest: rest,
            keyPlat: id
        })
    }
    /* deletes a existing plate */
    public delPlatillo(name:any, rest:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_DELPLATILLO}`,{
            keyRest: rest,
            nombre: name
        })
    }
    /* retrieves orders */
    public getCustomOrders(rest:any, status:any){
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_ALLORDERS}`,{
            params:{
                keyRest:rest,
                estado:status
            }
        })
    }
    /* change order status */
    public approveStatus(orderID:any, process:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_CHANGESTATUS}`,{
            pedido: orderID,
            proceso: process
        })
    }
    /* change order status */
    public declineStatus(orderID:any, process:any, reason:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_CHANGESTATUS}`,{
            pedido: orderID,
            proceso: process,
            razon: reason
        })
    }
    /* uploads a image */
    public uploadBase64ImagePlatillo(id:any, base64Img:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_IMAGE_PLATILLO}`,{
            keyPlat: id,
            img: base64Img
        })
    }
    public uploadUrlImagePlatillo(id:any, urlImg:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_IMAGE_PLATILLO}`,{
            keyPlat: id,
            url:urlImg
        })
    }
    /* uploads a image */
    public uploadBase64ImageRestaurant(id:any, base64Img:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_IMAGE_RESTAURANT}`,{
            keyRest: id,
            img: base64Img
        })
    }
    /* deletes a expired order */
    public deleteExpiredOrder(restId:any){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_DELETE_EXPIRED}`,{
            keyRest: restId
        })
    }
    /* get an user by id */
    public getUser(email: any) {
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_GET_USER}`,
        {
            params: {
                email: email
            }
        });
    }
    /* add restaurant */
    public addRestaurant(name:string, company:string, description:string, location:any, schedule:any, email:string){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_ADDRESTAURANT}`,{
            nombre: name,
            empresa: company,
            descripcion: description,
            ubicacion: location,
            horario: JSON.stringify(schedule),
            email: email
        })
    }
    /* add restaurant */
    public modRestaurant(name:string, company:string, description:string, location:any, schedule:any, email:string, restId:string){
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_MODRESTAURANT}`,{
            nombre: name,
            empresa: company,
            descripcion: description,
            ubicacion: location,
            horario: JSON.stringify(schedule),
            email: email,
            keyRest: restId
        })
    }
    /* set an user by id */
    public setUser(email: any, nombre: any, telefono: any, ubicacion: any, override: boolean) {
      const usuario: any = {};
      usuario.email = email;
      if (nombre !== undefined) {
        usuario.nombre = nombre;
      }
      if (telefono !== undefined) {
        usuario.telefono = telefono;
      }
      if (ubicacion !== undefined) {
        usuario.ubicacion = ubicacion;
      }
      if (override !== undefined) {
        usuario.override = override;
      }
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_SET_USER}`,
        usuario);
    }
    /* get all restaurants by user id */
    public getUserRestaurants(email:string){
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_GETRESTS}`,{
            params:{
                email: email
            }
        })
    }
    /* get all restaurants by user id */
    public android() {
        return this._service.get<StatusData>(`${this.apiUrl}${ENDPOINT_ANDROID}`, {
        });
    }
}
