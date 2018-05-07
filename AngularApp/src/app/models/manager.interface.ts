export interface ManagerInterface {
    status: boolean
    data:any
}

export interface Category {
    plates: Array<string>
}

export interface Platillo{
    Restaurante: string
    descripcion: string
    imagen: string
    nombre: string
}

export interface Restaurante {
    id: string
    descripcion: string
    nombre: string
}