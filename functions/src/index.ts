import * as functions from 'firebase-functions';

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
        platillos.get()
        .then((snapshot) => {
            var categorias = [];
            snapshot.forEach((doc) => {
                console.log(doc.data().categoria)
                categorias.push(doc.data().categoria);
            });
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
        let pagina = request.query.pagina
        let query = platillos
        if (pagina==undefined || pagina<1 || typeof(pagina)!='number')
            pagina=0
        if(categoria!=undefined)
            query=query.where('categoria','==',categoria)
        if(keyRest!=undefined)
            query=query.where('restaurante','==',keyRest)
        if(nombre!=undefined)
            query=query.where('nombre','==',nombre)
        query.get()
        .then((snapshot) => {
            if (snapshot.docs.length<=pagina*12)
                response.send({status:true,data:[]})
            let platRich = []
            let len = (snapshot.docs.length-(pagina*12))>12?12:(snapshot.docs.length-(pagina*12))
            for (let x=pagina*12;x<snapshot.docs.length;x++){
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
                        precio:snapshot.docs[x].data().precio})
                    if(platRich.length==len){
                        response.send({status:true,data:platRich});
                        return
                    }
                })
                .catch((err) => {
                    response.send({status:false,data:'Error obteniendo restaurante'});
                });
            }
        })
        .catch((err) => {
            response.send({status:false,data:'Error obteniendo documentos'});
        });
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
        let precio = request.body.precio
        if (descripcion==undefined || imagen==undefined || keyRest==undefined ||categoria==undefined||nombre==undefined || precio==undefined || typeof(precio)!='number' || precio<0){
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
                })
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
        let keyRest = request.body.keyRest
        let categoria = request.body.categoria
        let nombre = request.body.nombre
        let precio = Number(request.body.precio)
        console.log("Tipo "+typeof(precio) + " " + precio)
        if (descripcion==undefined || imagen==undefined || keyRest==undefined ||categoria==undefined||nombre==undefined || precio==undefined || typeof(precio)!='number' || precio<0){
            response.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(snapshot.empty)
                response.send({status:false,data:"Este platillo no existe en este restaurante"})
            else{
                snapshot.forEach(element => {
                    platillos.doc(element.id).set({
                        precio:precio,
                        categoria:categoria,
                        imagen:imagen,
                        descripcion:descripcion
                    },  {merge:true})
                    response.send({status:true,data:element.id})
                });
            }
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
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

export const addCarro = functions.https.onRequest((request, response) => {
    if (request.method='POST'){
        let keyRest = request.body.keyRest
        let nombre = request.body.nombre
        let cantidad = request.body.cantidad
        let ubicacion = request.body.ubicacion
        let fecha = request.body.fecha
        let email = request.body.email
        if (keyRest==undefined || nombre==undefined ||cantidad==undefined||ubicacion==undefined ||fecha==undefined || email==undefined){
            response.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.where('nombre','==',nombre).where('restaurante','==',keyRest).get().then((snapshot) => {
            if(snapshot.empty)
                response.send({status:false,data:"Este platillo no existe"})
            else{
                usuarios.doc(email).get()
                .then(usuario =>
                    {
                        if(usuario.exists){
                            let carrito = usuario.data().carrito
                            carrito.forEach(element => {
                                if(element.platillo==snapshot.docs[0].id){
                                    response.send({status:false,data:"Este platillo ya está en tu carrito"})
                                    return
                                }
                            });
                            carrito.push({
                                platillo:snapshot.docs[0].id,cantidad:cantidad,ubicacion:ubicacion,fecha:fecha
                            })
                            usuarios.doc(email).update({carrito:carrito})
                            .then(function() {
                                console.log("Enviado")
                                response.send({status:true,data:"Añadido"})
                            })
                            .catch(function(error) 
                            {response.send({status:false,data:"Error de conexión en la base de datos"})})
                        }
                        else
                            response.send({status:false,data:"El usuario solicitado no existe"})
                    })
                    .catch(err=> response.send({status:false,data:"Error de conexión en la base de datos"}))
            }
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})