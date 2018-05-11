export interface ManagerInterface {
    status: boolean
    data:any
}

export interface Category {
    plates: Array<string>
}

export interface Platillo{
    id:number 
    imagen: string
    descripcion: string
    nombre: string
    precio: number 
    restaurante: string 
    categoria: string 
}

export interface Restaurante {
    id: string
    descripcion: string
    nombre: string
}