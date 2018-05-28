import { Platillo} from './manager'; 
export class ManagerModel {
    navItems:Array<any>
    orderItems:Array<any>
    orderOptions:Array<any>
    headersApprovedTable:Array<any>
    headersPendingTable:Array<any>
    headersDeclinedTable:Array<any>
    headersExpiredTable:Array<any>
    constructor(){
        this.navItems = [
            {
                item: "Menu",
                href: '/menu'
            },
            {
                item: "Pedidos",
                href: '/pedidos'
            }
        ]
        this.orderItems = [
            {
                item: "Pedidos actuales",
                href: "/actuales"
            },
            {
                item: "Pedidos pendientes",
                href: "/pendientes"
            }
        ]
        this.orderOptions = [
            {
                item:"Ver pedidos expirados",
                opt:1
            },
            {
                item: "Ver pedidos rechazados",
                opt:2
            },
            {
                item: "Historial de pedidos",
                opt:3
            }
        ]
        this.headersApprovedTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Categoria", "Entrega","Finalizar"
        ]
        this.headersPendingTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Categoria", "Entrega", "Verificar"
        ]
        this.headersDeclinedTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Categoria", "Entrega", "Motivo"
        ]
        this.headersExpiredTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Categoria", "Entrega"
        ]
    }
    getNavItems(){
        return this.navItems
    }
    getOrderItems(){
        return this.orderItems
    }
    getOrderOptions(){
        return this.orderOptions
    }
    getExpiredTableHeaders(){
        return this.headersExpiredTable
    }
    getApprovedTableHeaders(){
        return this.headersApprovedTable
    }
    getPendingTableHeaders(){
        return this.headersPendingTable
    }
    getDeclinedTableHeaders(){
        return this.headersDeclinedTable
    }
}