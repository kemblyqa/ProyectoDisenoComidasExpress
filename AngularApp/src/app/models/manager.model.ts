import { Platillo} from './manager'; 
export class ManagerModel {
    navItems:Array<any>
    orderItems:Array<any>
    orderOptions:Array<any>
    headersApprovedTable:Array<any>
    headersPendingTable:Array<any>
    headersDeclinedTable:Array<any>
    headersFinishedTable:Array<any>
    headersRating:Array<any>
    headersRestaurants:Array<any>
    weekDays:Array<any>
    constructor(){
        this.navItems = [
            {
                item: "Menu",
                href: '/menu'
            },
            {
                item: "Pedidos",
                href: '/pedidos'
            },
            {
                item: "Mi cuenta",
                href: "/cuenta"
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
                item: "Ver pedidos finalizados",
                opt:1
            },
            {
                item: "Ver pedidos rechazados",
                opt:2
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
        this.headersFinishedTable = [
            "Cantidad", "Platillo", "Descripcion",
            "Fecha","Hora", "Email", "Precio", "Categoria", "Entrega"
        ]
        this.headersRating = [
            "Cliente", "Comentario", "Estrellas"
        ]
        this.headersRestaurants = [
            "Nombre", "Empresa", "Descripción", "Ubicación", "Ver horario", "Más acciones"
        ]
        this.weekDays = [
            {
                day:"Lunes",
                id:"l",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day:"Martes", 
                id:"k",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day:"Miércoles", 
                id:"m",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day: "Jueves", 
                id:"j",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day:"Viernes", 
                id:"v",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day:"Sábado",
                id:"s",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            },
            {
                day: "Domingo",
                id:"d",
                checked: false,
                timeInit: 
                {
                    hour: 7,
                    minute: 0
                },
                timeEnd: 
                {
                    hour: 19,
                    minute: 0
                },
                meridianInit: true,
                meridianEnd: true
            }
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
    getFinishedTableHeaders(){
        return this.headersFinishedTable
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
    getRatingTableHeaders(){
        return this.headersRating
    }
    getRestaurantsTableHeaders(){
        return this.headersRestaurants
    }
    getWeek(){
        return this.weekDays
    }
}