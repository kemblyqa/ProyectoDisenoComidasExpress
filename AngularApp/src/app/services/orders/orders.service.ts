import { Observable } from 'rxjs/Observable';
import { Pedido } from './../../models/manager';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ExpireOrderService {
    // create subject to listen and make changes to another components
    private orders = new Subject<Pedido[]>()
    public changeValue(orders: Pedido[]){
        this.orders.next(orders)
    }
    public getPendingOrders(): Observable<Pedido[]>{
        return this.orders.asObservable()
    }
}