import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Category, StatusData, Platillo } from './../../models/manager.interface';
//manager and restaurant endpoints
const ENDPOINT_GETCATEGORIES = "categoria"
const ENDPOINT_GETPLATILLOS = "GetPlatillosC"
const ENDPOINT_PLATILLOS_REST = "filtroPlat"
const ENDPOINT_ADDPLATILLO = "addPlatillo" 
const ENDPOINT_MODPLATILLO = "modPlatillo" 
const ENDPOINT_DELPLATILLO = "delPlatillo" 

@Injectable()
export class ManagerService {
    //url develop mode
	public apiUrl:string = "http://localhost:5000/api/";
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
    public addPlatillo(name:any, description:any, price:any, category: any, rest:any, image:any){ 
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_ADDPLATILLO}`,{ 
            descripcion: description, 
            imagen: image, 
            categoria: category, 
            keyRest: rest, 
            nombre: name, 
            precio: price 
        }) 
    } 
    /* edits a existing plate */
    public modPlatillo(name:any, description:any, price:any, category: any, rest:any, image:any){ 
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_MODPLATILLO}`,{ 
            descripcion: description, 
            imagen: image, 
            categoria: category, 
            keyRest: rest, 
            nombre: name, 
            precio: price 
        }) 
    } 
    /* deletes a existing plate */
    public delPlatillo(name:any, rest:any){ 
        return this._service.post<StatusData>(`${this.apiUrl}${ENDPOINT_DELPLATILLO}`,{ 
            keyRest: rest, 
            nombre: name 
        }) 
    }
}