import { Platillo, Category } from './manager.interface';
export class ManagerModel {
    navItems:Array<any>
    categories:Category[]
    platillos:Platillo[]
    menu:Platillo[]

    constructor(){
        this.platillos = [
            {
                Restaurante: "Panchito",
                descripcion: "delicioso",
                imagen: "",
                nombre: "Pinto con huevo y natilla"
            },
            {
                Restaurante: "Panchito",
                descripcion: "grasa",
                imagen: "",
                nombre: "Magnifica"
            },
            {
                Restaurante: "Panchito",
                descripcion: "delicioso",
                imagen: "",
                nombre: "Pinto con huevo y natilla"
            },
            {
                Restaurante: "Panchito",
                descripcion: "grasa",
                imagen: "",
                nombre: "Magnifica"
            }
        ]
        this.navItems = [
            {
                item: "Menu",
                href: '/menu'
            }
        ]
        this.menu= [
            {
                Restaurante: "Panchito",
                descripcion: "delicioso",
                imagen: "",
                nombre: "Pinto con huevo y natilla"
            },
            {
                Restaurante: "Panchito",
                descripcion: "grasa",
                imagen: "",
                nombre: "Magnifica"
            }
        ]        
    }
    getNavItems(){
        return this.navItems
    }

    getPlatillos(){
        return this.menu
    }
}