import { Platillo, Category } from './manager.interface';
export class ManagerModel {
    navItems:Array<any>
    categories:Array<any>
    platillos:Platillo[]
    menu:Platillo[]
    columnPlatillos:Array<any>

    constructor(){
        this.categories = ["Hamburguesas", "Bebidas","Desayunos"]
        // this.platillos = [
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "delicioso",
        //         imagen: "",
        //         nombre: "Pinto con huevo y natilla",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "grasa",
        //         imagen: "",
        //         nombre: "Magnifica",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "delicioso",
        //         imagen: "",
        //         nombre: "Pinto con huevo y natilla",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "grasa",
        //         imagen: "",
        //         nombre: "Magnifica",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "delicioso",
        //         imagen: "",
        //         nombre: "Pinto con huevo y natilla",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "grasa",
        //         imagen: "",
        //         nombre: "Magnifica",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "delicioso",
        //         imagen: "",
        //         nombre: "Pinto con huevo y natilla",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "grasa",
        //         imagen: "",
        //         nombre: "Magnifica",
        //         categoria: "Hamburguesa"
        //     }
        // ]
        this.navItems = [
            {
                item: "Menu",
                href: '/menu'
            }
        ]
        // this.menu= [
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "delicioso",
        //         imagen: "",
        //         nombre: "Pinto con huevo y natilla",
        //         categoria: "Hamburguesa"
        //     },
        //     {
        //         restaurante: "Panchito",
        //         descripcion: "grasa",
        //         imagen: "",
        //         nombre: "Magnifica",
        //         categoria: "Hamburguesa"
        //     }
        // ]        
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