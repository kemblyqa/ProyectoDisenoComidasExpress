import { Platillo, Category } from './manager.interface';
export class ManagerModel {
    navItems:Array<any>
    categories:Array<any>
    platillos:Platillo[]
    menu:Platillo[]
    columnPlatillos:Array<any>

    constructor(){
        this.categories = ["Hamburguesas", "Bebidas","Desayunos"]
        
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
        return this.platillos
    }
    getCategories(){
        return this.categories
    }
    getColumns(){
        return this.columnPlatillos
    }
}