export interface ManagerInterface {
    status: boolean
    data:any
}

export interface Category {
    plates: Array<string>
}

export interface Platillo{
    restaurante: string
    descripcion: string
    imagen: string
    nombre: string
    categoria: string
}

export interface Restaurante {
    id: string
    descripcion: string
    nombre: string
}