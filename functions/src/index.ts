import * as functions from 'firebase-functions';
import { request } from 'https';
import { isUndefined } from 'util';

const async = require('async')
const admin = require('firebase-admin');
const gcs = require('@google-cloud/storage')
admin.initializeApp(functions.config().firebase);

var db = admin.firestore();
var bucket = admin.storage().bucket();
var usuarios = db.collection("Usuario");
var platillos = db.collection("Platillo");
var restaurantes = db.collection("Restaurante");
var pedidos = db.collection("Pedido");
export const categoria = functions.https.onRequest((req, res) => {
    if (req.method=="GET"){
        let query = platillos
        if(req.query.keyRest!=undefined)
            query=query.where('restaurante','==',req.query.keyRest)
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
            res.status(200).send({status:true,data:categorias});
        })
        .catch((err) => {
            res.send({status:false,data:'Error obteniendo documentos'});
        });
    }
    else
        res.send({status:false,data:'Solicitud desconocida'});
});

export const filtroPlat = functions.https.onRequest((req, res) => {
    if (req.method=="GET"){
        let categoria = req.query.categoria
        let keyRest = req.query.keyRest
        let nombre = req.query.nombre
        let pagina = parseInt(req.query.pagina)
        if (pagina<1 || isNaN(pagina))
            pagina=1
        let query = platillos
        if(categoria!=undefined)
            query=query.where('categoria','==',categoria)
        if(keyRest!=undefined)
            query=query.where('restaurante','==',keyRest)
        if(nombre!=undefined)
            query=query.where('nombre','==',nombre)
        query.get()
        .then((snapshot) => {
            if (snapshot.docs.length<=(pagina-1)*12)
                res.send({status:true,data:[[],0]})
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
                    if(platRich.length==len)
                        res.send({status:true,data:[platRich,Math.floor(snapshot.docs.length/12)+(snapshot.docs.length%12!=0?1:0)]});
                }).catch((err) => {
                    res.send({status:false,data:'Error obteniendo restaurante'})});
            }
        }).catch((err) => {res.send({status:false,data:'Error obteniendo documentos'})});
    }
    else
        res.send({status:false,data:'Solicitud desconocida'});
});

export const addPlatillo = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        let descripcion = req.body.descripcion
        let imagen = req.body.imagen
        let categoria = req.body.categoria
        let keyRest = req.body.keyRest
        let nombre = req.body.nombre
        let precio = parseInt(req.body.precio)
        if (descripcion==undefined || imagen==undefined || keyRest==undefined ||categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
            res.send({status:false,data:"Falta un dato"})
            return
        }
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(!snapshot.empty)
                res.send({status:false,data:"Este platillo ya existe en este restaurante"})
            else
            restaurantes.doc(keyRest).get().then(snapshot2 =>{
                if(!snapshot2.exists)
                    res.send({status:false,data:"El restaurante no existe"})
                else
                platillos.add({restaurante:keyRest,imagen:imagen,categoria:categoria,descripcion:descripcion,nombre:nombre,precio:precio}).then(ref =>{
                    res.send({status:true,data:ref.id})
                }).catch(err=>{res.send({status:false,data:"Error inesperado en la base de datos"})})
            }).catch(err=>{res.send({status:false,data:"Error insertando platillo"})})
        }).catch(err=>{res.send({status:false,data:"Error insertando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

export const modPlatillo = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        let descripcion = req.body.descripcion
        let imagen = req.body.imagen
        let categoria = req.body.categoria
        let nombre = req.body.nombre
        let precio = Number(req.body.precio)
        let keyPlat = req.body.keyPlat
        if (descripcion==undefined || keyPlat==undefined || imagen==undefined || categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
            res.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.doc(keyPlat).get().then(snapshot => {
            if(!snapshot.exists)
                res.send({status:false,data:"El platillo solicitado no existe"})
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
                        res.send({status:true,data:keyPlat})
                    }
                    else
                        res.send({status:false,data:"El nombre de este platillo ya existe en el restaurante destino"})
                }).catch(err=>{res.send({status:false,data:"Error modificando platillo"})})
            }
        }).catch(err=>{res.send({status:false,data:"Error modificando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

export const delPlatillo = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        let keyRest = req.body.keyRest
        let nombre = req.body.nombre
        if (keyRest==undefined ||categoria==undefined||nombre==undefined){
            res.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(snapshot.empty)
                res.send({status:false,data:"Este platillo no existe en este restaurante"})
            else{
                snapshot.forEach(element => {
                    platillos.doc(element.id).delete().then(function() {
                        res.send({status:true,data:"Document successfully deleted!"});
                    }).catch(function(error) {
                        res.send({status:false,data:"Error removing document " + error });
                    });
                });
            }
        }).catch(err=>{res.send({status:false,data:"Error insertando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

export const itemCarro = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        let ubicacion;
        if (req.body.ubicacion=='local')
            ubicacion=req.body.ubicacion;
        else{
            try{ubicacion = JSON.parse(req.body.ubicacion)
                ubicacion = new admin.firestore.GeoPoint(ubicacion[0],ubicacion[1])}
            catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
        }
        let fecha;
        try{
            fecha = new Date(req.body.fecha)
            if(isNaN(fecha.getTime())){res.send({status:false,data:"Error interpretando la fecha"});return}
            if((fecha.getTime()-Date.now())<10800000){
                res.send({status:false,data:"La fecha del pedido debe estar 3 horas delante de la fecha actual"})
                return
            }
        }
        catch(e){res.send({status:false,data:"Error interpretando la fecha"});return}
        if (
            typeof(req.body.keyRest)!='string' || 
            typeof(req.body.nombre)!='string' ||
            isNaN(parseInt(req.body.cantidad,10))||
            req.body.fecha==undefined || req.body.email==undefined)
            {
            res.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        let keyRest = req.body.keyRest
        let nombre = req.body.nombre
        let cantidad = parseInt(req.body.cantidad,10)
        let email = req.body.email
        let override = req.body.override == 'true'
        platillos.where('nombre','==',nombre).where('restaurante','==',keyRest).get().then((snapshot) => {
            if(snapshot.empty)
                res.send({status:false,data:"Este platillo no existe"})
            else{
                usuarios.doc(email).get()
                .then(usuario =>
                    {
                        if(usuario.exists){
                            let carrito = usuario.data().carrito
                            if(carrito[snapshot.docs[0].id]!=undefined && !override){
                                res.send({status:false,data:"El platillo a insertar ya se encuentra en tu carrito, puedes editarlo"})
                                return
                            }
                            carrito[snapshot.docs[0].id]={
                                platillo:snapshot.docs[0].id,cantidad:cantidad,ubicacion:ubicacion,fecha:fecha
                            }
                            usuarios.doc(email).update({carrito:carrito})
                            .then(function() {
                                res.send({status:true,data:"Añadido"})
                            })
                            .catch(function(error) 
                            {res.send({status:false,data:"Error de conexión en la base de datos"})})
                        }
                        else
                            res.send({status:false,data:"El usuario solicitado no existe"})
                    })
                    .catch(err=> {res.send({status:false,data:"Error de conexión en la base de datos"})})
            }
        }).catch(err=>{res.send({status:false,data:"Error insertando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

export const delCarro = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        if (
            typeof(req.body.email)!='string' ||
            typeof(req.body.platillo)!='string')
            {
            res.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        let email = req.body.email
        let platillo = req.body.platillo
        usuarios.doc(email).get().then((snapshot) => {
            if(!snapshot.exists)
                res.send({status:false,data:"El usuario "+email+" no existe"})
            else{
                let carrito = snapshot.data().carrito
                if(carrito[platillo]==undefined){res.send({status:false,data:"Este platillo no está en tu carrito"});return}
                delete carrito[platillo]
                usuarios.doc(email).update({carrito:carrito}).then(()=>{
                    res.send({status:true,data:"Eliminado"})
                })
            }
        }).catch(err=>{res.send({status:false,data:"Error eliminando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

export const caja = functions.https.onRequest((req, res) => {
    if(req.method=='POST'){
        let email = req.body.email
        if(email==undefined)
            res.send({status:false,data:"Se requiere el campo email"})
        else{
            usuarios.doc(email).get().then(usuario =>{
                if(usuario.exists){
                    let carrito = usuario.data().carrito
                    let save = (email,carrito)=>{usuarios.doc(email).set({carrito:carrito},{merge:true})}
                    for(var item in carrito){
                        platillos.doc(carrito[item].platillo).get().then(platillo=>{
                            if(platillo.exists){
                                pedidos.add({email:email,
                                    restaurante:platillo.data().restaurante,
                                    ubicacion:carrito[item].ubicacion,
                                    categoria:platillo.data().categoria,
                                    descripcion:platillo.data().descripcion,
                                    nombre:platillo.data().nombre,
                                    precio:platillo.data().precio,
                                    fecha:carrito[item].fecha,
                                    cantidad:carrito[item].cantidad
                                    ,estado:"pendiente"}).then(ref=>{
                                    delete carrito[item]
                                    if(Object.keys(carrito).length==0){
                                        save(email,carrito)
                                        res.send({status:true,data:"Carrito procesado"})
                                    }
                                }).catch(err => {save(email,carrito);res.send({status:false,data:"Error procesando un pedido"})})
                            }
                            else {save(email,carrito);res.send({status:false,data:"Uno de los platillos del carrito no existe"})}
                        }).catch(err => {save(email,carrito);res.send({status:false,data:"Error procesando un pedido"})})
                    }
                }
                else
                    res.send({status:false,data:"El usuario solicitado no existe"})
            })
        }
    }
    else
        res.send({status:false,data:'Metodo invalido'})
})

export const filtroPedidos = functions.https.onRequest((req, res) => {
    if(req.method=='GET'){
        let restaurante = req.query.keyRest
        let estado = req.query.estado
        let email = req.query.email
        let pagina = parseInt(req.query.pagina)
        if (pagina<1 || isNaN(pagina))
            pagina=1

        let query = pedidos
        if(restaurante!=undefined)
            query=query.where('restaurante','==',restaurante)
        if(estado!=undefined)
            query=query.where('estado','==',estado)
        if(email!=undefined)
            query=query.where('email','==',email)
        query.get().then(items => {
            if (items.docs.length<=(pagina-1)*10)
                res.send({status:true,data:[[],0]})
            let pedRich = []
            let len = (items.docs.length-((pagina-1)*10))>10?10:(items.docs.length-((pagina-1)*10))
            for (let x=(pagina-1)*10;x<items.docs.length;x++){
                pedRich.push(items.docs[x].data())
                pedRich[pedRich.length-1]["id"]=items.docs[x].id
                if (pedRich.length==len){
                    res.send({status:true,data:[pedRich,Math.floor(items.docs.length/10)+(items.docs.length%10!=0?1:0)]})
                }
            }
        }).catch(err => {res.send({status:false,data:"Error obteniendo pedidos"})})
    }
    else
        res.send({status:false,data:"Metodo no reconocido"})
})

export const verCarrito = functions.https.onRequest((req, res) => {
    if(req.method=='GET'){
        let email = req.query.email
        if(email==undefined){
            res.send({status:false,data:"Falta email"})
            return;
        }
        usuarios.doc(email).get().then(usuario => {
            if(usuario.exists){
                let carrito = usuario.data().carrito
                let carritoRich=[]
                let keys=[]
                for(let key in carrito){console.log(key)
                    keys.push(key)
                }
                for(let x =0;x<keys.length;x++){
                    platillos.doc(keys[x]).get().then(platillo => {
                        restaurantes.doc(platillo.data().restaurante).get().then(rest =>{
                            carritoRich.push({
                                clave:keys[x],
                                nombre:platillo.data().nombre,
                                descripcion:platillo.data().descripcion,
                                cantidad:carrito[keys[x]].cantidad,
                                precio:platillo.data().precio,
                                fecha:carrito[keys[x]].fecha,
                                ubicacion:carrito[keys[x]].ubicacion,
                                restaurante:[platillo.data().restaurante,rest.data().nombre]})
                            if(keys.length==carritoRich.length)
                                res.send({status:true,data:carritoRich})
                        }).catch(err => {res.send({status:false,data:"Error obteniendo restaurante"})})
                    }).catch(err => {res.send({status:false,data:"Error obteniendo platillos"})})
                }
            }
            else
                res.send({status:false,data:"El usuario no existe"})
        }).catch(err => {res.send({status:false,data:"Error obteniendo el usuario"})})
    }
    else
        res.send({status:false,data:"Metodo no reconocido"})
})

export const setEstado = functions.https.onRequest((req, res) => {
    if(req.method=='POST'){
        let keyPedido = req.body.pedido
        let estado = req.body.estado
        if(keyPedido==undefined || estado[0]=="pendiente" || estado[0]==undefined || (estado[0]!="aprobado" && estado[0]!="rechazado"&&estado[0]!="finalizado"))
            res.send({status:false,data:"Datos no validos"})
        else{
            pedidos.doc(keyPedido).get().then(pedido => {
                if(pedido.exists){
                    let pEstado=pedido.data().estado
                    if(pEstado[0]=="pendiente" && estado[0]=="finalizado")
                        res.send({status:false,data:"No se puede finalizar un producto pendiente"})
                    else if(pEstado[0]=="rechazado" || pEstado[0]=="finalizado")
                        res.send({status:false,data:"No se puede modificar el estado \"rechazado\" ni \"finalizado\""})
                    else{
                        pedidos.doc(keyPedido).set({estado:estado},{merge:true})
                        res.send({status:true,data:"El pedido " + keyPedido + " ha sido " + estado[0]})
                    }
                }
                else
                    res.send({status:false,data:"El pedido solicitado no existe"})
            })
        }
    }
    else
        res.send({status:false,data:"Metodo no reconocido"});
})

export const subirImagenPlat = functions.https.onRequest((req, res) => {
    if (req.method === 'POST') {
        let keyPlat=req.body.keyPlat //clave de platillo
        var img = req.body.img //base64
        if(keyPlat==undefined || img==undefined || !Buffer.from(img, 'base64').toString('base64')===img){
            res.send({status:false,data:"Platillo o imagen no valido"})
            return;
        }
        platillos.doc(keyPlat).get().then(snapshot =>{
            if(!snapshot.exists){
                res.send({status:false,data:"El platillo solicitado no existe"})
                return
            }
            var mimeType = 'image/jpeg',
            fileName = keyPlat+'.jpg',
            imageBuffer = new Buffer(img, 'base64');
            var file = bucket.file('platillos/' + fileName);
            file.save(imageBuffer,{
                metadata: {contentType: mimeType}}, 
                error => {
                if (error) {
                    res.send({status:false,data:'No se pudo subir la imagen.'});
                }
                file.acl.add({
                    entity: 'allUsers',
                    role: gcs.acl.READER_ROLE //gcs ->'@google-cloud/storage'
                    },
                    function(err, aclObject) {
                        if (!err){
                            let URL = "https://storage.googleapis.com/designexpresstec.appspot.com/" + file.id;
                            platillos.doc(keyPlat).set({imagen:URL},{merge:true})
                            res.send({status:true,data:URL});
                        }
                        else
                            res.send({status:false,data:"No se pudieron establecer los servicios: " + err});
                    });
            });
        }).catch(err =>{res.send({status:false,data:"Error obteniendo el platillo"})})
    } else  res.send({status:false,data:"Solo se admite POST"});
})

export const nuevoCliente = functions.https.onRequest((req, res) => {
    if (req.method == 'POST')
        if(isUndefined(req.body.nombre) || isUndefined(req.body.email) || isUndefined(req.body.telefono))
            res.send({status:false,data:"Faltan datos"})
        else{
            let ubicacion
            try{ubicacion = JSON.parse(req.body.ubicacion)
                ubicacion = new admin.firestore.GeoPoint(ubicacion[0],ubicacion[1])}
            catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!re.test(String(req.body.email).toLowerCase()))
                res.send({status:false,data:"Correo no valido"})
            else{
                usuarios.doc(req.body.email).get().then(snapshot => {
                    if(!snapshot.exists)
                        res.send({status:false,data:"Este correo electronico ya está registrado"})
                    else{
                        usuarios.doc(req.body.email).set({
                            nombre:req.body.nombre,
                            telefono:req.body.telefono,
                            ubicacion:ubicacion,
                            restaurantes:[],
                            tarjeta:{
                                codigo:undefined,
                                dueño:undefined,
                                numero:undefined,
                                proveedor:undefined,
                                vencimiento:undefined}})
                        res.send({status:true,data:`Bienvenido, ${req.body.nombre}` })
                    }
                }).catch(err => {res.send({status:false,data:"Error obteniendo datos de servidor"})})
            }
        }
    else
        res.send({status:false,data:"Este endpoint solo admite POST"})
})