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

export interface Pedido {
    ubicacion: {
        _latitude: number,
        _longitude: number
    }
    email: string
    fecha: Date
    restaurante: string
    nombre:string
    estado:{
        proceso:string
        razon:string
    }
    cantidad:number
    descripcion:string
    precio:number
    categoria:string
    entrega:string
    id:string
}