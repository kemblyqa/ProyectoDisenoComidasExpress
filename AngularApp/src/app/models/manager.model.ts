export class ManagerModel {
    navItems:Array<any>
    constructor(){
        this.navItems = [
            {
                item: "Menu",
                href: '/client'
            }
        ]
    }
    getNavItems(){
        return this.navItems
    }
}