import { Platillo} from './manager'; 
export class ManagerModel {
    navItems:Array<any>
    orderItems:Array<any>
    headersTable:Array<any>
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
        this.headersTable = [
            "Cantidad", "Platillo",
            "Fecha", "Email", "Estado", "Finalizado"
        ]
    }
    getNavItems(){
        return this.navItems
    }
    getOrderItems(){
        return this.orderItems
    }
    getTableHeaders(){
        return this.headersTable
    }
}