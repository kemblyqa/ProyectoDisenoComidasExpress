export interface ManagerInterface {
    status: boolean
    data:any
}

export interface Category {
    plates: Array<string>
}

export interface Platillo{
    imagen: string
    descripcion: string
    nombre: string
    restaurante: {
        nombre: string,
        id: string
    }
}

export interface Restaurante {
    id: string
    descripcion: string
    nombre: string
}