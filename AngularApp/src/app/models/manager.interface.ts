export interface StatusData {
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
    restaurante: {
        id: string
        nombre:string
    } 
    categoria: string 
}

export interface Restaurante {
    id: string
    descripcion: string
    nombre: string
}