import * as functions from 'firebase-functions';
import { request } from 'https';

const async = require('async')
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

var usuarios = db.collection("Usuario");
var platillos = db.collection("Platillo");
var restaurantes = db.collection("Restaurante");
var pedidos = db.collection("Pedido");
export const categoria = functions.https.onRequest((request, response) => {
    if (request.method=="GET"){
        let query = platillos
        if(request.query.keyRest!=undefined)
            query=query.where('restaurante','==',request.query.keyRest)
        query.get()
        .then((snapshot) => {
            let categorias = [];
            let temp = {}
            snapshot.forEach((doc) => {
                temp[doc.data().categoria]=doc.data().categoria;
            });
            for (var cat in temp){
                categorias.push(cat)
            }
            response.status(200).send({status:true,data:categorias});
        })
        .catch((err) => {
            response.send({status:false,data:'Error obteniendo documentos'});
        });
    }
    else
        response.send({status:false,data:'Solicitud desconocida'});
});

export const filtroPlat = functions.https.onRequest((request, response) => {
    if (request.method=="GET"){
        let categoria = request.query.categoria
        let keyRest = request.query.keyRest
        let nombre = request.query.nombre
        let pagina = parseInt(request.query.pagina)
        let query = platillos
        if (pagina<1 || isNaN(pagina))
            pagina=1
        if(categoria!=undefined)
            query=query.where('categoria','==',categoria)
        if(keyRest!=undefined)
            query=query.where('restaurante','==',keyRest)
        if(nombre!=undefined)
            query=query.where('nombre','==',nombre)
        query.get()
        .then((snapshot) => {
            console.log(snapshot)
            if (snapshot.docs.length<=(pagina-1)*12)
                response.send({status:true,data:[]})
            let platRich = []
            let len = (snapshot.docs.length-((pagina-1)*12))>12?12:(snapshot.docs.length-((pagina-1)*12))
            for (let x=(pagina-1)*12;x<snapshot.docs.length;x++){
                restaurantes.doc(snapshot.docs[x].data().restaurante).get().then((Restaurante) => {
                    var res;
                    if(!Restaurante.exists)
                        res="Desconocido"
                    else
                        res={nombre:Restaurante.data().nombre,id:Restaurante.id};
                    platRich.push({
                        imagen:snapshot.docs[x].data().imagen,
                        descripcion:snapshot.docs[x].data().descripcion,
                        nombre:snapshot.docs[x].data().nombre,
                        Restaurante:res,
                        precio:snapshot.docs[x].data().precio,
                        id: snapshot.docs[x].id})
                    if(platRich.length==len){
                        response.send({status:true,data:platRich});
                    }
                }).catch((err) => {
                    response.send({status:false,data:'Error obteniendo restaurante'})});
            }
        }).catch((err) => {response.send({status:false,data:'Error obteniendo documentos'})});
    }
    else
        response.send({status:false,data:'Solicitud desconocida'});
});

export const addPlatillo = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        let descripcion = request.body.descripcion
        let imagen = request.body.imagen
        let categoria = request.body.categoria
        let keyRest = request.body.keyRest
        let nombre = request.body.nombre
        let precio = parseInt(request.body.precio)
        if (descripcion==undefined || imagen==undefined || keyRest==undefined ||categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
            response.send({status:false,data:"Falta un dato"})
            return
        }
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(!snapshot.empty)
                response.send({status:false,data:"Este platillo ya existe en este restaurante"})
            else
            restaurantes.doc(keyRest).get().then(snapshot2 =>{
                if(!snapshot2.exists)
                    response.send({status:false,data:"El restaurante no existe"})
                else
                platillos.add({restaurante:keyRest,imagen:imagen,categoria:categoria,descripcion:descripcion,nombre:nombre,precio:precio}).then(ref =>{
                    response.send({status:true,data:ref.id})
                }).catch(err=>{response.send({status:false,data:"Error inesperado en la base de datos"})})
            }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})

export const modPlatillo = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        let descripcion = request.body.descripcion
        let imagen = request.body.imagen
        let categoria = request.body.categoria
        let nombre = request.body.nombre
        let precio = Number(request.body.precio)
        let keyPlat = request.body.keyPlat
        if (descripcion==undefined || keyPlat==undefined || imagen==undefined || categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
            response.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.doc(keyPlat).get().then(snapshot => {
            if(!snapshot.exists)
                response.send({status:false,data:"El platillo solicitado no existe"})
            else{
                platillos.where('restaurante','==',snapshot.data().restaurante).where('nombre','==',nombre).get().then(dupes =>{
                    if(dupes.empty || (!dupes.empty && dupes.docs.length==1 && dupes.docs[0].id==keyPlat)){
                        platillos.doc(keyPlat).set({
                            nombre:nombre,
                            precio:precio,
                            categoria:categoria,
                            imagen:imagen,
                            descripcion:descripcion
                        },  {merge:true})
                        response.send({status:true,data:keyPlat})
                    }
                    else
                        response.send({status:false,data:"El nombre de este platillo ya existe en el restaurante destino"})
                }).catch(err=>{response.send({status:false,data:"Error modificando platillo"})})
            }
        }).catch(err=>{response.send({status:false,data:"Error modificando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})

export const delPlatillo = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        let keyRest = request.body.keyRest
        let nombre = request.body.nombre
        if (keyRest==undefined ||categoria==undefined||nombre==undefined){
            response.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(snapshot.empty)
                response.send({status:false,data:"Este platillo no existe en este restaurante"})
            else{
                snapshot.forEach(element => {
                    platillos.doc(element.id).delete().then(function() {
                        response.send({status:true,data:"Document successfully deleted!"});
                    }).catch(function(error) {
                        response.send({status:false,data:"Error removing document " + error });
                    });
                });
            }
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})

export const itemCarro = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        let ubicacion;
        try{ubicacion = JSON.parse(request.body.ubicacion)}
        catch(e){response.send({status:false,data:"Error interpretando la ubicación"});return}
        let fecha;
        try{
            fecha = new Date(request.body.fecha)
            if(isNaN(fecha.getTime())){response.send({status:false,data:"Error interpretando la fecha"});return}
            if((fecha.getTime()-Date.now())<10800000){
                response.send({status:false,data:"La fecha del pedido debe estar 3 horas delante de la fecha actual"})
                return
            }
        }
        catch(e){response.send({status:false,data:"Error interpretando la ubicación"});return}
        if (
            typeof(request.body.keyRest)!='string' || 
            typeof(request.body.nombre)!='string' ||
            isNaN(parseInt(request.body.cantidad,10))|| 
            typeof(ubicacion[0])!='number'|| typeof(ubicacion[1])!='number' 
            ||request.body.fecha==undefined || request.body.email==undefined)
            {
            response.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        let keyRest = request.body.keyRest
        let nombre = request.body.nombre
        let cantidad = parseInt(request.body.cantidad,10)
        let email = request.body.email
        let override = request.body.override == 'true'
        ubicacion = new admin.firestore.GeoPoint(ubicacion[0],ubicacion[1])
        platillos.where('nombre','==',nombre).where('restaurante','==',keyRest).get().then((snapshot) => {
            if(snapshot.empty)
                response.send({status:false,data:"Este platillo no existe"})
            else{
                usuarios.doc(email).get()
                .then(usuario =>
                    {
                        if(usuario.exists){
                            let carrito = usuario.data().carrito
                            if(carrito[snapshot.docs[0].id]!=undefined && !override){
                                response.send({status:false,data:"El platillo a insertar ya se encuentra en tu carrito, puedes editarlo"})
                                return
                            }
                            carrito[snapshot.docs[0].id]={
                                platillo:snapshot.docs[0].id,cantidad:cantidad,ubicacion:ubicacion,fecha:fecha
                            }
                            usuarios.doc(email).update({carrito:carrito})
                            .then(function() {
                                response.send({status:true,data:"Añadido"})
                            })
                            .catch(function(error) 
                            {response.send({status:false,data:"Error de conexión en la base de datos"})})
                        }
                        else
                            response.send({status:false,data:"El usuario solicitado no existe"})
                    })
                    .catch(err=> {response.send({status:false,data:"Error de conexión en la base de datos"})})
            }
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})

export const delCarro = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        if (
            typeof(request.body.email)!='string' ||
            typeof(request.body.platillo)!='string')
            {
            response.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        let email = request.body.email
        let platillo = request.body.platillo
        usuarios.doc(email).get().then((snapshot) => {
            if(!snapshot.exists)
                response.send({status:false,data:"El usuario "+email+" no existe"})
            else{
                let carrito = snapshot.data().carrito
                if(carrito[platillo]==undefined){response.send({status:false,data:"Este platillo no está en tu carrito"});return}
                delete carrito[platillo]
                usuarios.doc(email).update({carrito:carrito}).then(()=>{
                    response.send({status:true,data:"Eliminado"})
                })
            }
        }).catch(err=>{response.send({status:false,data:"Error eliminando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})

export const caja = functions.https.onRequest((request, response) => {
    if(request.method=='POST'){
        let email = request.body.email
        if(email==undefined)
            response.send({status:false,data:"Se requiere el campo email"})
        else{
            usuarios.doc(email).get().then(usuario =>{
                if(usuario.exists){
                    let carrito = usuario.data().carrito
                    let save = (email,carrito)=>{usuarios.doc(email).set({carrito:carrito},{merge:true})}
                    for(var item in carrito){
                        platillos.doc(carrito[item].platillo).get().then(platillo=>{
                            if(platillo.exists){
                                pedidos.add({email:email,restaurante:carrito[item].restaurante,ubicacion:carrito[item].ubicacion,platillo:carrito[item].platillo,fecha:carrito[item].fecha,cantidad:carrito[item].cantidad,estado:"pendiente"}).then(ref=>{
                                    delete carrito[item]
                                    if(Object.keys(carrito).length==0){
                                        save(email,carrito)
                                        response.send({status:true,data:"Carrito procesado"})
                                    }
                                }).catch(err => {save(email,carrito);response.send({status:false,data:"Error procesando un pedido"})})
                            }
                            else {save(email,carrito);response.send({status:false,data:"Uno de los platillos del carrito no existe"})}
                        }).catch(err => {save(email,carrito);response.send({status:false,data:"Error procesando un pedido"})})
                    }
                }
                else
                    response.send({status:false,data:"El usuario solicitado no existe"})
            })
        }
    }
    else
        response.send({status:false,data:'Metodo invalido'})
})

export const filtroPedidos = functions.https.onRequest((request, response) => {
    if(request.method=='GET'){
        let restaurante = request.query.keyRest
        let estado = request.query.estado
        let email = request.query.email
        let query = pedidos
        if(restaurante!=undefined)
            query=query.where('restaurante','==',restaurante)
        if(estado!=undefined)
            query=query.where('estado','==',estado)
        if(email!=undefined)
            query=query.where('email','==',email)
        query.get().then(items => {
            let pedRich = []
            items.forEach(element => {
                pedRich.push(element.data())
            });
            response.send({status:true,data:pedRich})
        }).catch(err => {response.send({status:false,data:"Error obteniendo pedidos"})})
    }
    else
        response.send({status:false,data:"Metodo no reconocido"})
})