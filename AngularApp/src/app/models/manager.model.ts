import { Platillo} from './manager.interface'; 
export class ManagerModel {
    navItems:Array<any>
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
    }
    getNavItems(){
        return this.navItems
    }
}