import { Platillo} from './manager.interface'; 
export class ManagerModel {
    navItems:Array<any>
    constructor(){
        this.navItems = [
            {
                item: "Menu",
                href: '/menu'
            }
        ]
    }
    getNavItems(){
        return this.navItems
    }
}