import { Platillo} from './manager'; 
export class ManagerModel {
    navItems:Array<any>
    orderItems:Array<any>
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
        this.headersApprovedTable = [
            "Cantidad", "Platillo",
            "Fecha","Hora", "Email", "Estado", "Ubicación", "Finalizado"
        ]
        this.headersPendingTable = [
            "Cantidad", "Platillo",
            "Fecha","Hora", "Email", "Estado", "Ubicación", "Verificar"
        ]
        this.headersDeclinedTable = [
            "Cantidad", "Platillo",
            "Fecha","Hora", "Email", "Estado", "Ubicación", "Motivo"
        ]
    }
    getNavItems(){
        return this.navItems
    }
    getOrderItems(){
        return this.orderItems
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