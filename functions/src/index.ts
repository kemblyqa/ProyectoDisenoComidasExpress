import * as functions from 'firebase-functions';
import { request } from 'https';
import { isUndefined } from 'util';
import { GeoPoint } from '@google-cloud/firestore';

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
let dias=[ 'd','l', 'k', 'm', 'j', 'v', 's' ]

//comprueba que todos los datos de la lista están definidos

function allDefined(list){
    for (let x = 0;x<list.lenght;x++){
        if(list[x]==undefined)
            return false
    }
    return true
}

function base64MimeType(encoded){
    var result = null;

    if (typeof encoded !== 'string') {
      return result;
    }

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*/);
    if (mime && mime.length) {
      result = mime[1];
    }
    return result;
}

function getHorario(h:string){
    let bien = true
    try{
        let horario=JSON.parse(h)
        dias.forEach(x=>{
            if(horario[x]==undefined){
                bien=false
                return undefined
            }
            for(let y = 0; horario[x][y]!=undefined; y++){
                if(
                    horario[x][y].init==undefined ||
                    horario[x][y].end==undefined ||
                    horario[x][y].init>horario[x][y].end ||
                    horario[x][y].init<0 ||
                    horario[x][y].end>1440){
                        bien=false
                        return undefined
                    }
            };
        })
        if(bien)
            return horario
        else
            return undefined
    }catch(e){return undefined}
}

function enHorario(pedido:Date,horario:Object) : boolean{
    let dia = pedido.getDay()
    let min = (pedido.getHours()*60) + pedido.getMinutes()
    let atencion:Array<{init:number,end:number}> = horario[dias[dia]]
    let aceptado:boolean = false
    atencion.forEach(e =>{
        if(e.init<=min && e.end>=min)
            aceptado=true
    })
    return aceptado
}

function genGeopoint(tupla:Array<number>,all:boolean) : GeoPoint{
    try{
        if(tupla[0]==0 && tupla[1]==0 && !all)
            return undefined
        return new GeoPoint(tupla[0],tupla[1])
    }
    catch(e){
        return undefined
    }
}
function distancia(a:GeoPoint,b:GeoPoint) : number{
    var R = 6371e3; // metres
    var φ1 = a.latitude
    var φ2 = b.longitude
    var Δφ = (b.latitude-a.latitude)
    var Δλ = (b.longitude-b.longitude)

    var x = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
    return R * c;
}
function filtroUbicacion(platillos,ubicacion:GeoPoint,rests,kilometros:number) : Array<Object>{
    let response = []
    for(let y=0;platillos[y]!=undefined;y++){
        if(JSON.stringify(rests[platillos[y].data().restaurante])!="[0,0]" && distancia(rests[platillos[y].data().restaurante],ubicacion)
            <=kilometros*1000)
            response.push(platillos[y])
    }
    return response
}
function decodeFile(img:string) : {mime:string,file:Buffer}{
    let temp = img.split(',')
    let ret
    ret.mime = base64MimeType(temp[0])
    ret.file = new Buffer(temp[1], 'base64')
    if(ret.mime==undefined || ret.file==undefined)
        return undefined
    ret.type = ret.mime.split('/')[0];
    ret.extension = ret.mime.split('/')[1];
    return ret
}
export const categoria = functions.https.onRequest((req, res) => {
    if (req.method=="GET"){
        let query = platillos
        if(req.query.keyRest!=undefined)
            query=query.where('restaurante','==',req.query.keyRest)
        query.get()
        .then((snapshot) => {
            let temp = {}
            snapshot.forEach((doc) => {
                temp[doc.data().categoria]=doc.data().categoria;
            });
            res.status(200).send({status:true,data:Object.keys(temp)});
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
        let ubicacion
        if(req.query.ubicacion!=undefined)
        try{
            ubicacion = genGeopoint(JSON.parse(req.query.ubicacion),false)
        }
        catch(e){
            res.send({status:false,data:"Error interpretando la ubicacion"})
            return
        }
        let rango = parseInt(req.query.rango)
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
        else
            query=query.orderBy('nombre')
        query.get()
        .then((snapshot) => {
            let raw = snapshot.docs
            let rests={}
            raw.forEach(e=>{
                rests[e.data().restaurante]=[0,0]
            })
            let unicos = Object.keys(rests)
            let c=0
            for(let x=0;x<unicos.length;x++){
                restaurantes.doc(unicos[x]).get().then(r=>{
                    if(r.exists)
                        rests[unicos[x]]=<GeoPoint>r.data().ubicacion
                    c++
                    if(c==unicos.length)
                    {
                        if(!isUndefined(ubicacion) && !isNaN(rango)){
                            raw=filtroUbicacion(raw,ubicacion,rests,rango)
                        }
                        if (raw.length<=(pagina-1)*12)
                            res.send({status:true,data:[[],0]})
                        let platRich = []
                        let len = (raw.length-((pagina-1)*12))>12?12:(raw.length-((pagina-1)*12))
                        let cont = 0;
                        for (let x=(pagina-1)*12;x<len+(pagina-1)*12;x++){
                            restaurantes.doc(raw[x].data().restaurante).get().then((Restaurante) => {
                                var rest;
                                if(!Restaurante.exists)
                                    rest="Desconocido"
                                else
                                    rest={nombre:Restaurante.data().nombre,id:Restaurante.id};
                                platRich[x%12] = {
                                    imagen:raw[x].data().imagen,
                                    descripcion:raw[x].data().descripcion,
                                    nombre:raw[x].data().nombre,
                                    Restaurante:rest,
                                    precio:raw[x].data().precio,
                                    id: raw[x].id}
                                cont++;
                                if(cont==len)
                                    res.send({status:true,data:[platRich,Math.floor(raw.length/12)+(raw.length%12!=0?1:0)]});
                            }).catch((err) => {
                                res.send({status:false,data:'Error obteniendo restaurante'})});
                        }
                    }
                }).catch(e=>{
                    res.send({status:false,data:JSON.stringify(e)})})
            }
        }).catch((err) => {
            console.log(err)
            res.send({status:false,data:`Error obteniendo documentos ${err}`})});
    }
    else
        res.send({status:false,data:'Solicitud desconocida'});
});

export const addPlatillo = functions.https.onRequest((req, res) => {
    if (req.method='POST'){
        let descripcion = req.body.descripcion
        let categoria = req.body.categoria
        let keyRest = req.body.keyRest
        let nombre = req.body.nombre
        let precio = parseInt(req.body.precio)
        if (descripcion==undefined || keyRest==undefined ||categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
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
                platillos.add({
                    restaurante:keyRest,
                    categoria:categoria,
                    descripcion:descripcion,
                    nombre:nombre,
                    precio:precio,
                    imagen:"https://firebasestorage.googleapis.com/v0/b/designexpresstec.appspot.com/o/depositphotos_119480056-stock-illustration-platter-chef-food-icon-vector.jpg?alt=media&token=8b2d5cb5-543a-4702-b7da-a4e1f042c30e"})
                    .then(ref =>{
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
        let categoria = req.body.categoria
        let nombre = req.body.nombre
        let precio = Number(req.body.precio)
        let keyPlat = req.body.keyPlat
        if (descripcion==undefined || keyPlat==undefined || categoria==undefined||nombre==undefined || precio==undefined || isNaN(precio) || precio<0){
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
        let ubicacion
        try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),true)}
        catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
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
        else if(ubicacion ==undefined){
          res.send({status:false,data:"La ubicación especificada es invalida"})
        }
        let keyRest = req.body.keyRest
        let nombre = req.body.nombre
        let cantidad = parseInt(req.body.cantidad,10)
        let email = req.body.email
        let override = req.body.override == 'true'

        platillos.where('nombre','==',nombre).where('restaurante','==',keyRest).get().then((snapshot) => {
            if(snapshot.empty)
                res.send({status:false,data:"Este platillo no existe"})
            else{
              let platillo = snapshot.docs[0];
                usuarios.doc(email).get()
                .then(usuario =>
                    {
                    if(usuario.exists){
                        restaurantes.doc(keyRest).get().then(rest =>{
                            if(!enHorario(fecha,rest.data().horario)){
                                res.send({status:false,data:"El pedido no se ha realizado dentro del horario de atención del restaurante"})
                                return
                            }
                            let carrito = usuario.data().carrito
                            if(carrito[platillo.id]!=undefined && !override){
                              res.send({status:false,data:"El platillo a insertar ya se encuentra en tu carrito, puedes editarlo"})
                            }
                            else{
                              carrito[platillo.id]={
                                  cantidad:cantidad,ubicacion:ubicacion,fecha:fecha
                              }
                              usuarios.doc(email).update({carrito:carrito})
                              .then(function() {
                                  res.send({status:true,data:"Añadido"})
                              })
                              .catch(function(error)
                              {res.send({status:false,data:"Error de conexión en la base de datos"})})
                            }

                        }).catch(err=> {
                            console.log(err)
                            res.send({status:false,data:`Error obteniendo restaurante: ${JSON.stringify(err)}`})})
                        }
                    else
                        res.send({status:false,data:"El usuario solicitado no existe"})
                }).catch(err=> {res.send({status:false,data:"Error de conexión en la base de datos"})})
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
                        platillos.doc(item).get().then(platillo=>{
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
                                    ,estado:{proceso:"pendiente"}}).then(ref=>{
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
            query=query.where('estado.proceso','==',estado)
        if(email!=undefined)
            query=query.where('email','==',email)
        query.orderBy('fecha')
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
        let proceso = req.body.proceso
        let razon = req.body.razon
        if(keyPedido==undefined || proceso=="pendiente" || (proceso=="rechazado" && razon == undefined) || proceso==undefined || (proceso!="aprobado" && proceso!="rechazado"&&proceso[0]!="finalizado"))
            res.send({status:false,data:"Datos no validos"})
        else{
            pedidos.doc(keyPedido).get().then(pedido => {
                if(pedido.exists){
                    let pEstado=pedido.data().estado.proceso
                    if(pEstado=="pendiente" && proceso=="finalizado")
                        res.send({status:false,data:"No se puede finalizar un producto pendiente"})
                    else if(pEstado=="rechazado" || pEstado=="finalizado")
                        res.send({status:false,data:"No se puede modificar el estado \"rechazado\" ni \"finalizado\""})
                    else{
                        pedidos.doc(keyPedido).set({estado:{proceso:proceso,razon:razon==undefined?"":razon}},{merge:true})
                        res.send({status:true,data:"El pedido ha sido " + proceso})
                    }
                }
                else
                    res.send({status:false,data:"El pedido solicitado no existe"})
            }).catch(err=>{res.send({status:false,data:"Error obteniendo pedido: ",err})})
        }
    }
    else
        res.send({status:false,data:"Metodo no reconocido"});
})

export const subirImagenPlat = functions.https.onRequest((req, res) => {
    if (req.method === 'POST') {
        let keyPlat=req.body.keyPlat //clave de platillo
        var img = req.body.img //base64
        var url = req.body.url //url
        if(!isUndefined(img) && !isUndefined(url)){
            res.send({status:false,data:"Solo puede enviar URL o IMG, no ambos"})
            return
        }
        else if(keyPlat==undefined)
            res.send({status:false,data:"Platillo no recibido"})
        else if (url!=undefined){
            platillos.doc(keyPlat).get().then(snapshot =>{
                if(!snapshot.exists){
                    res.send({status:false,data:"El platillo solicitado no existe"})
                }
                else{
                    platillos.doc(keyPlat).set({imagen:url},{merge:true})
                    res.send({status:true,data:`La URL del platillo ${keyPlat} ha sido modificada a ${url}`})
                }
            }).catch(err =>{res.send({status:false,data:"Error obteniendo el platillo"})})
        }
        else if(img==undefined){
            res.send({status:false,data:"Imagen no valida"})
            return;
        }
        else{
            platillos.doc(keyPlat).get().then(snapshot =>{
                if(!snapshot.exists){
                    res.send({status:false,data:"El platillo solicitado no existe"})
                    return
                }
                img = decodeFile(img)
                if(img==undefined){
                    res.send({status:false,data:"Archivo invalido"})
                    return
                }
                else if(img.type!='image'){
                    res.send({status:false,data:"El archivo enviado no es una imagen valida"})
                    return
                }
                else{
                    var fileName = keyPlat+'.'+img.extension
                    var file = bucket.file('platillos/' + fileName);
                    file.save(
                        img.file,
                        {metadata: {contentType: img.mime}},
                        error => {
                            if (error)
                                res.send({status:false,data:'No se pudo subir la imagen.'});
                            else{
                                let URL = file.metadata.mediaLink
                                platillos.doc(keyPlat).set({imagen:URL},{merge:true})
                                res.send({status:true,data:`La URL del platillo ${keyPlat} ahora es ${URL}`});
                            }
                        }
                    );
                }
            }).catch(err =>{res.send({status:false,data:"Error obteniendo el platillo"})})
        }
    } else  res.send({status:false,data:"Solo se admite POST"});
})

export const subirImagenRest = functions.https.onRequest((req, res) => {
    if (req.method === 'POST') {
        let keyRest=req.body.keyRest //clave de platillo
        var img = req.body.img //base64
        if(!allDefined([img,keyRest])){
            res.send({status:false,data:"Se requiere la imagen y clave de restaurante"})
            return
        }
        else{
            restaurantes.doc(keyRest).get().then(snapshot =>{
                if(!snapshot.exists){
                    res.send({status:false,data:"El restaurante solicitado no existe"})
                    return
                }
                img = decodeFile(img)
                if(img==undefined){
                    res.send({status:false,data:"Archivo invalido"})
                    return
                }
                else if(img.type!='image'){
                    res.send({status:false,data:"El archivo enviado no es una imagen valida"})
                    return
                }
                else{
                    var fileName = keyRest+'.'+img.extension
                    var file = bucket.file('restaurantes/' + fileName);
                    file.save(
                        img.file,
                        {metadata: {contentType: img.mime}},
                        error => {
                            if (error)
                                res.send({status:false,data:'No se pudo subir la imagen.'});
                            else{
                                let URL = file.metadata.mediaLink
                                restaurantes.doc(keyRest).set({imagen:URL},{merge:true})
                                res.send({status:true,data:`La URL del restaurante ${keyRest} ahora es ${URL}`});
                            }
                        }
                    );
                }
            }).catch(err =>{res.send({status:false,data:"Error obteniendo el platillo"})})
        }
    } else  res.send({status:false,data:"Solo se admite POST"});
})

export const setUsuario = functions.https.onRequest((req, res) => {
    if (req.method == 'POST')
        if(isUndefined(req.body.nombre) || isUndefined(req.body.email) || isUndefined(req.body.telefono))
            res.send({status:false,data:"Faltan datos"})
        else{
            let ubicacion
            try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
            catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!re.test(String(req.body.email).toLowerCase()))
              res.send({status:false,data:"Correo no valido"})
            else if(ubicacion==undefined)
              res.send({status:false,data:"ubicación invalida"})
            else{
                usuarios.doc(req.body.email).get().then(snapshot => {
                    if(snapshot.exists && !(req.body.override== 'true'))
                        res.send({status:false,data:"Este correo electronico ya está registrado"})
                    else{
                        try{
                            usuarios.doc(req.body.email).set({
                                nombre:req.body.nombre,
                                telefono:req.body.telefono,
                                ubicacion:ubicacion,
                                carrito:{}})
                            res.send({status:true,data:`Bienvenido, ${req.body.nombre}` })
                        }catch(e){res.send({status:false,data:`Error insertando usuario: ${JSON.stringify(e)}`})}
                    }
                }).catch(err => {res.send({status:false,data:"Error obteniendo datos de servidor"})})
            }
        }
    else
        res.send({status:false,data:"Este endpoint solo admite POST"})
})

export const setTarjeta = functions.https.onRequest((req, res) => {
    let codigo = req.body.codigo
    let numero = req.body.numero
    let exp = req.body.exp
    let dueño = req.body.dueño
    let proveedor = req.body.proveedor
    let email = req.body.email
    if(!allDefined([codigo,numero,exp,dueño,proveedor,email]) || !(/([\d]{4})(-[\d]{4}){3}/gm).test(numero) || !(/\d{2}\/\d{2}\/\d{2}/gm).test(exp) || isNaN(parseInt(codigo)))
        res.send({status:false,data:"Faltan valores o no son correctos"})
    else{
        usuarios.doc(email).get().then(user => {
            if(!user.exists)
                res.send({status:false,data:"El email especificado no existe"})
            else{
                user.doc(email).set({tarjeta:{codigo:codigo,numero:numero,proveedor:proveedor,vencimiento:exp,dueño:dueño}},{merge:true})
                res.send({status:true,data:`Se ha especificado la tarjeta para el usuario ${email}`})
            }
        }).catch(err => {res.send({status:false,data:`Error procesando usuario,error : ${err}`})})
    }
})

export const addRestaurante = functions.https.onRequest((req, res) => {
    if(req.method=='POST'){
        let nombre = req.body.nombre
        let empresa = req.body.empresa
        let descripcion = req.body.descripcion
        let ubicacion = req.body.ubicacion
        let horario = getHorario(req.body.horario)
        let email = req.body.email
        if(!allDefined([nombre,empresa,descripcion,ubicacion[0],ubicacion[1],horario])){
            res.send({status:false,data:"Faltan Datos"})
            return
        }
        else{
            try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
            catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
            if(horario==undefined)
              res.send({status:false,data:"Formato de horario no valido, debe tener este formato {d:[{init:minutos,end:minutos}],l:[{init:minutos,end:minutos}],k:[{init:minutos,end:minutos}],m:[{init:minutos,end:minutos}],j:[{init:minutos,end:minutos}],v:[{init:minutos,end:minutos}],s:[{init:minutos,end:minutos}]}"})
            else if(ubicacion==undefined)
              res.send({status:false,data:"Ubicacion no valida"})
            else{
                usuarios.doc(email).get().then(user =>{
                    if(user.exists){
                        let data = {
                            nombre: nombre,
                            empresa:empresa,
                            descripcion:descripcion,
                            horario:horario,
                            ubicacion:ubicacion}
                        restaurantes.add(data).then(ref =>{
                            let rests = user.data().restaurantes==undefined?[]:user.data().restaurantes
                            rests.push(ref.id)
                            usuarios.doc(email).set({restaurantes:rests},{merge:true})
                            res.send({status:true,data:"Restaurante creado"})
                        }).catch(e => {res.send({status:false,data:"Error insertando restaurante: ",e});return})
                    }
                    else{
                        res.send({status:false,data:"Este usuario no existe"})
                    }

                }).catch(e => {res.send({status:false,data:"Error obteniendo usuario: ",e});return})
            }
        }
    }
    else{
        res.send({status:false,data:"Este metodo solo admite POST"})
    }
})

export const modRestaurante = functions.https.onRequest((req, res) => {
    if(req.method=='POST'){
        let nombre = req.body.nombre
        let empresa = req.body.empresa
        let descripcion = req.body.descripcion
        let ubicacion = req.body.ubicacion
        let horario = getHorario(req.body.horario)
        console.log(getHorario(req.body.horario))
        let keyRest = req.body.keyRest
        if(!allDefined([nombre,empresa,descripcion,ubicacion[0],ubicacion[1],horario,keyRest]))
            res.send({status:false,data:"Faltan Datos"})
        else{
            try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
            catch(e){res.send({status:false,data:"Error interpretando la ubicación"});return}
            if(horario==undefined)
              res.send({status:false,data:"Formato de horario no valido, debe tener este formato {d:[{init:minutos,end:minutos}],l:[{init:minutos,end:minutos}],k:[{init:minutos,end:minutos}],m:[{init:minutos,end:minutos}],j:[{init:minutos,end:minutos}],v:[{init:minutos,end:minutos}],s:[{init:minutos,end:minutos}]}"})
            else if(ubicacion==undefined)
              res.send({status:false,data:"Ubicacion no valida"})
            else{
                restaurantes.doc(keyRest).update({nombre: nombre,empresa:empresa,descripcion:descripcion,horario:horario,ubicacion:ubicacion}).then(ref =>{
                res.send({status:true,data:"Restaurante modificado"})

                }).catch(e => {res.send({status:false,data:"Error modificando restaurante: ",e});return})
            }
        }
    }
    else{
        res.send({status:false,data:"Este metodo solo admite POST"})
    }
})
