import { Platillo} from './manager'; 
export class ManagerModel {
    navItems:Array<any>
    orderItems:Array<any>
    orderOptions:Array<any>
    headersApprovedTable:Array<any>
    headersPendingTable:Array<any>
    headersDeclinedTable:Array<any>
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
            },
            {
                item: "Pedidos rechazados",
                href: "/rechazados"
            }
        ]
        this.orderOptions = [
            {
                item:"Ver pedidos expirados",
                opt:1
            },
            {
                item: "Historial de pedidos",
                opt:2
            }
        ]
        this.headersApprovedTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Estado", "Categoria", "Ubicación", "Entrega","Finalizado"
        ]
        this.headersPendingTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Estado", "Categoria", "Ubicación", "Entrega", "Verificar"
        ]
        this.headersDeclinedTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Estado", "Categoria", "Ubicación", "Entrega", "Motivo"
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