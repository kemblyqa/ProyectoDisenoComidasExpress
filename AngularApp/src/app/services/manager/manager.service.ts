import { Injectable } from '@angular/core';
import { HttpService } from './../http.service';
import { Observable } from 'rxjs/Observable';
import { Category, ManagerInterface } from './../../models/manager.interface';
//manager and restaurant endpoints
const ENDPOINT_GETCATEGORIES = "categoria"
const ENDPOINT_GETPLATILLOS = "GetPlatillosC"

@Injectable()
export class ManagerService {
    status:ManagerInterface
    categories:Category[]
    constructor(private service: HttpService){}

    public getCategories(){
        this.service.getService(ENDPOINT_GETCATEGORIES)
        .then(
            response => {
                this.status = response
                if(this.status.status){
                    this.categories = response.data
                }
                
                console.log(JSON.stringify(this.categories))
            })
        .catch(
            err => {
                console.log(JSON.stringify(err))
            }
        )
    }

    public getPlatillos(id: any){
        this.service.getServiceParams(ENDPOINT_GETPLATILLOS,{id:id,pagina:1})
        .then(
            response => {
                this.status = response
            }
        )
    }
}