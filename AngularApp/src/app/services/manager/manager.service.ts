import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Category, ManagerInterface, Platillo } from './../../models/manager.interface';
//manager and restaurant endpoints
const ENDPOINT_GETCATEGORIES = "categoria"
const ENDPOINT_GETPLATILLOS = "GetPlatillosC"
const ENDPOINT_PLATILLOS_REST = "filtroPlat"

@Injectable()
export class ManagerService {
    //url develop mode
	public apiUrl:string = "http://localhost:5000/api/";

    constructor(private _service: HttpClient){}

    public getCategories() {
        return this._service.get<ManagerInterface>(`${this.apiUrl}${ENDPOINT_GETCATEGORIES}`)
    }

    public getPlatillosByCategory(cat: any) {
        return this._service.get<ManagerInterface>(`${this.apiUrl}${ENDPOINT_PLATILLOS_REST}`, {params: {categoria:cat}})
    }
}