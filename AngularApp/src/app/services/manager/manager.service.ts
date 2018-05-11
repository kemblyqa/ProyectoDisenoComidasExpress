import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Category, ManagerInterface, Platillo } from './../../models/manager.interface';
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

    public getPlatillosByCategory(cat: any, page:any, restId: any) { 
        return this._service.get<ManagerInterface>(`${this.apiUrl}${ENDPOINT_PLATILLOS_REST}`,  
        { 
            params: { 
                categoria:cat,  
                pagina:page, 
                keyRest: restId 
            } 
        }) 
    } 
 
    public addPlatillo(name:any, description:any, price:any, category: any, rest:any, image:any){ 
        return this._service.post<ManagerInterface>(`${this.apiUrl}${ENDPOINT_ADDPLATILLO}`,{ 
            descripcion: description, 
            imagen: image, 
            categoria: category, 
            keyRest: rest, 
            nombre: name, 
            precio: price 
        }) 
    } 
 
    public modPlatillo(name:any, description:any, price:any, category: any, rest:any, image:any){ 
        return this._service.post<ManagerInterface>(`${this.apiUrl}${ENDPOINT_MODPLATILLO}`,{ 
            descripcion: description, 
            imagen: image, 
            categoria: category, 
            keyRest: rest, 
            nombre: name, 
            precio: price 
        }) 
    } 
 
    public delPlatillo(name:any, rest:any){ 
        return this._service.post<ManagerInterface>(`${this.apiUrl}${ENDPOINT_DELPLATILLO}`,{ 
            keyRest: rest, 
            nombre: name 
        }) 
    }
}