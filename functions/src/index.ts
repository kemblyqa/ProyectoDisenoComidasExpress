import * as functions from 'firebase-functions';
//import { request } from 'https';
import { isUndefined } from 'util';
//const async = require('async')
const express = require('express');
const cors = require('cors');

const admin = require('firebase-admin');

const app = express();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

//const gcs = require('@google-cloud/storage')
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const bucket = admin.storage().bucket();
const usuarios = db.collection("Usuario");
const platillos = db.collection("Platillo");
const restaurantes = db.collection("Restaurante");
const pedidos = db.collection("Pedido");
const dias=[ 'd','l', 'k', 'm', 'j', 'v', 's' ]

//comprueba que todos los datos de la lista están definidos

function allDefined(list){
    for (let x = 0;x<list.lenght;x++){
        if(list[x]===undefined)
            return false
    }
    return true
}

function base64MimeType(encoded){
    let result = null;

    if (typeof encoded !== 'string') {
      return result;
    }

    const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*/);
    if (mime && mime.length) {
      result = mime[1];
    }
    return result;
}

function getHorario(h:string){
    let bien = true
    try{
        const horario=JSON.parse(h)
        dias.forEach(x=>{
            if(horario[x]===undefined){
                bien=false
                return undefined
            }
            for(let y = 0; horario[x][y]!==undefined; y++){
                if(
                    horario[x][y].init===undefined ||
                    horario[x][y].end===undefined ||
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
    const dia = pedido.getDay()
    const min = (pedido.getHours()*60) + pedido.getMinutes()
    const atencion:Array<{init:number,end:number}> = horario[dias[dia]]
    let aceptado:boolean = false
    atencion.forEach(e =>{
        if(e.init<=min && e.end>=min)
            aceptado=true
    })
    return aceptado
}

function genGeopoint(tupla:Array<number>,all:boolean){
    try{
        if(tupla[0]===0 && tupla[1]===0 && !all)
            return undefined
        return new admin.firestore.GeoPoint(tupla[0],tupla[1])
    }
    catch(e){
      console.log(e);
      return undefined
    }
}
function distancia(a,b) : number{
    const R = 6371e3; // metres
    const φ1 = a.latitude
    const φ2 = b.longitude
    const Δφ = (b.latitude-a.latitude)
    const Δλ = (b.longitude-b.longitude)

    const x = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
    return R * c;
}
function filtroUbicacion(plats,ubicacion,rests,kilometros:number) : Array<Object>{
    const response = []
    for(let y=0;plats[y]!==undefined;y++){
        if(JSON.stringify(rests[plats[y].data().restaurante])!=="[0,0]" && distancia(rests[plats[y].data().restaurante],ubicacion)
            <=kilometros*1000)
            response.push(plats[y])
    }
    return response
}
function decodeFile(img:string) : {mime:string,file:Buffer}{
    const temp = img.split(',')
    const ret:{mime,file,type,extension}={mime:undefined,file:undefined,type:undefined,extension:undefined};
    ret.mime = base64MimeType(temp[0])
    ret.file = new Buffer(temp[1], 'base64')
    if(ret.mime===undefined || ret.file===undefined)
        return undefined
    ret.type = ret.mime.split('/')[0];
    ret.extension = ret.mime.split('/')[1];
    return ret
}
const categoria = functions.https.onRequest((req, res) => {
    if (req.method==="GET"){
        let query : any = platillos
        if(req.query.keyRest!==undefined)
            query=query.where('restaurante','==',req.query.keyRest)
        query.get()
        .then((snapshot) => {
            const temp = {}
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

const filtroPlat = functions.https.onRequest((req, res) => {
    if (req.method==="GET"){
        const catFilter = req.query.categoria
        const keyRest = req.query.keyRest
        const nombre = req.query.nombre
        let ubicacion
        const rating = parseInt(req.query.rating)
        if(req.query.ubicacion!==undefined)
        try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
        catch(e){
          try{
            ubicacion = genGeopoint(JSON.parse(JSON.stringify(req.body.ubicacion)),false);
          } catch(err){
            console.log(err);
            res.send({status:false,data:"Error interpretando la ubicación"});return}
        }
        const rango = parseInt(req.query.rango)
        let pagina = parseInt(req.query.pagina)
        if (pagina<1 || isNaN(pagina))
            pagina=1
        let query = platillos
        if(catFilter!==undefined)
            query=query.where('categoria','==',catFilter)
        if(keyRest!==undefined)
            query=query.where('restaurante','==',keyRest)
        if(nombre!==undefined)
            query=query.where('nombre','==',nombre)
        else
            query=query.orderBy('nombre')
        query.get()
        .then((snapshot) => {
          if(snapshot.empty)
            res.send({status:true,data:[]})
          else{
            let raw = snapshot.docs
            const rests={}
            raw.forEach(e=>{
                rests[e.data().restaurante]=[0,0]
            })
            const unicos = Object.keys(rests)
            let c=0
            console.log(unicos);
            unicos.forEach(unico => {
                restaurantes.doc(unico).get().then(r=>{
                    if(r.exists)
                        rests[unico]=r.data().ubicacion
                    c++
                    if(c===unicos.length)
                    {
                        if(!isUndefined(ubicacion) && !isNaN(rango)){
                            raw=filtroUbicacion(raw,ubicacion,rests,rango)
                        }
                        const refined = []
                        for(let y=0;raw[y]!==undefined;y++){
                          refined[y] = raw[y].data()
                          refined[y].id = raw[y].id
                          const calificaciones = raw[y].data().calificaciones===undefined?{}:raw[y].data().calificaciones
                          refined[y].calificaciones = calificaciones
                          let n = 1
                          let t = 4
                          for(const u in calificaciones){
                            t+=calificaciones[u].stars
                            n++
                          }
                          refined[y].rating = t/n
                        }
                        if(!isNaN(rating)){
                          for(let y = refined.length-1;y!==-1;y--){
                            if(refined[y].rating<rating)
                              refined.splice(y,1)
                          }
                        }
                        if (refined.length<=(pagina-1)*12)
                            res.send({status:true,data:[[],0]})
                        const platRich = []
                        const len = (refined.length-((pagina-1)*12))>12?12:(refined.length-((pagina-1)*12))
                        let cont = 0;
                        for (let x=(pagina-1)*12;x<len+(pagina-1)*12;x++){
                            restaurantes.doc(refined[x].restaurante).get().then((Restaurante) => {
                                let rest;
                                if(!Restaurante.exists)
                                    rest="Desconocido"
                                else
                                    rest={nombre:Restaurante.data().nombre,id:Restaurante.id};
                                platRich[x%12] = {
                                    imagen:refined[x].imagen,
                                    descripcion:refined[x].descripcion,
                                    nombre:refined[x].nombre,
                                    Restaurante:rest,
                                    precio:refined[x].precio,
                                    rating:refined[x].rating,
                                    calificaciones:refined[x].calificaciones,
                                    id: refined[x].id}
                                cont++;
                                if(cont===len)
                                    res.send({status:true,data:[platRich,Math.floor(refined.length/12)+(refined.length%12!==0?1:0)]});
                            }).catch((err) => {
                                res.send({status:false,data:'Error obteniendo restaurante'})});
                        }
                    }
                }).catch(e=>{
                  console.log(e)
                  res.send({status:false,data:"Error procesando restaurantes"})})
            })
          }
        }).catch((err) => {
            console.log(err)
            res.send({status:false,data:`Error obteniendo documentos ${err}`})});
    }
    else
        res.send({status:false,data:'Solicitud desconocida'});
});

const addPlatillo = functions.https.onRequest((req, res) => {
    if (req.method==='POST'){
        const descripcion = req.body.descripcion
        const cat = req.body.categoria
        const keyRest = req.body.keyRest
        const nombre = req.body.nombre
        const precio = parseInt(req.body.precio)
        if (descripcion===undefined || keyRest===undefined ||cat===undefined||nombre===undefined || precio===undefined || isNaN(precio) || precio<0){
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
                    categoria:cat,
                    descripcion:descripcion,
                    nombre:nombre,
                    precio:precio,
                    calificaciones:{},
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

const modPlatillo = functions.https.onRequest((req, res) => {
    if (req.method==='POST'){
        const descripcion = req.body.descripcion
        const cat = req.body.categoria
        const nombre = req.body.nombre
        const precio = Number(req.body.precio)
        const keyPlat = req.body.keyPlat
        if (descripcion===undefined || keyPlat===undefined || cat===undefined||nombre===undefined || precio===undefined || isNaN(precio) || precio<0){
            res.send({status:false,data:"Faltan datos"})
            return
        }
        platillos.doc(keyPlat).get().then(snapshot => {
            if(!snapshot.exists)
                res.send({status:false,data:"El platillo solicitado no existe"})
            else{
                platillos.where('restaurante','==',snapshot.data().restaurante).where('nombre','==',nombre).get().then(dupes =>{
                    if(dupes.empty || (!dupes.empty && dupes.docs.length===1 && dupes.docs[0].id===keyPlat)){
                        platillos.doc(keyPlat).set({
                            nombre:nombre,
                            precio:precio,
                            categoria:cat,
                            descripcion:descripcion,
                            calificaciones : {}
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

const delPlatillo = functions.https.onRequest((req, res) => {
    if (req.method==='POST'){
        const keyRest = req.body.keyRest
        const nombre = req.body.nombre
        if (keyRest===undefined ||nombre===undefined){
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

const itemCarro = functions.https.onRequest((req, res) => {
    if (req.method==='POST'){
        let ubicacion
        try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
        catch(e){
          try{
            ubicacion = genGeopoint(JSON.parse(JSON.stringify(req.body.ubicacion)),false);
          } catch(err){
            console.log(err);
            res.send({status:false,data:"Error interpretando la ubicación"});return}
        }
        let fecha;
        try{
            fecha = new Date(isNaN(req.body.fecha)?req.body.fecha:parseInt(req.body.fecha))
            console.log(`fecha: ${fecha}`)
            if(isNaN(fecha.getTime())){res.send({status:false,data:"Error interpretando la fecha"});return}
            if((fecha.getTime()-Date.now())<10800000){
                res.send({status:false,data:"La fechas del pedido debe estar 3 horas delante de la fecha actual"})
                return
            }
        }
        catch(e){
          console.log(e);
          res.send({status:false,data:"Error interpretando la fecha"});return}
        if (
            typeof(req.body.keyRest)!=='string' ||
            typeof(req.body.nombre)!=='string' ||
            isNaN(parseInt(req.body.cantidad,10))||
            req.body.fecha===undefined || req.body.email===undefined)
            {
            res.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        else if(ubicacion ===undefined){
          res.send({status:false,data:"La ubicación especificada es invalida"})
        }
        const keyRest = req.body.keyRest
        const nombre = req.body.nombre
        const cantidad = parseInt(req.body.cantidad,10)
        const email = req.body.email
        const override = req.body.override === 'true'

        platillos.where('nombre','==',nombre).where('restaurante','==',keyRest).get().then((snapshot) => {
            if(snapshot.empty)
                res.send({status:false,data:"Este platillo no existe"})
            else{
              const platillo = snapshot.docs[0];
                usuarios.doc(email).get()
                .then(usuario =>
                    {
                    if(usuario.exists){
                        restaurantes.doc(keyRest).get().then(rest =>{
                            if(!enHorario(fecha,rest.data().horario)){
                                res.send({status:false,data:"El pedido no se ha realizado dentro del horario de atención del restaurante"})
                                return
                            }
                            const carrito = usuario.data().carrito
                            if(carrito[platillo.id]!==undefined && !override){
                              res.send({status:false,data:"El platillo a insertar ya se encuentra en tu carrito, puedes editarlo"})
                            }
                            else{
                              carrito[platillo.id]={
                                  cantidad:cantidad,ubicacion:ubicacion,fecha:fecha
                              }
                              usuarios.doc(email).set({carrito:carrito},{merge:true})
                              .then(() => {
                                  res.send({status:true,data:"Añadido"})
                              })
                              .catch(errorr=>
                              {res.send({status:false,data:"Error de conexión en la base de datos"})})
                            }
                        }).catch(err=> {
                            console.log(err)
                            res.send({status:false,data:`Error obteniendo restaurante, Codigo de error:${JSON.stringify(err, Object.getOwnPropertyNames(err))}`})})
                        }
                    else
                        res.send({status:false,data:"El usuario solicitado no existe"})
                }).catch(err=> {
                  console.log(err);
                  res.send({status:false,data:"Error de conexión en la base de datos"})})
            }
        }).catch(err=>{
          console.log(err);
          res.send({status:false,data:"Error insertando platillo"})})
    }
    else
        res.send({status:false,data:'Metodo no encontrado'})
})

const delCarro = functions.https.onRequest((req, res) => {
    if (req.method==='POST'){
        if (
            typeof(req.body.email)!=='string' ||
            typeof(req.body.platillo)!=='string')
            {
            res.send({status:false,data:"No se recibieron los parametros correctos"})
            return}
        const email = req.body.email
        const platillo = req.body.platillo
        usuarios.doc(email).get().then((snapshot) => {
            if(!snapshot.exists)
                res.send({status:false,data:"El usuario "+email+" no existe"})
            else{
                const carrito = snapshot.data().carrito
                if(carrito[platillo]===undefined){res.send({status:false,data:"Este platillo no está en tu carrito"});return}
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

const caja = functions.https.onRequest((req, res) => {
    if(req.method==='POST'){
        const email = req.body.email
        if(email===undefined)
            res.send({status:false,data:"Se requiere el campo email"})
        else{
            usuarios.doc(email).get().then(usuario =>{
                if(usuario.exists){
                    const carrito = usuario.data().carrito
                    const save = (e,c)=>{usuarios.doc(e).set({carrito:c},{merge:true})}
                    const keys = Object.keys(carrito)
                    if(keys.length===0)
                      res.send({status:true,data:"Tu carrito ya estaba vacío"})
                    else
                      keys.forEach(item=>{
                          platillos.doc(item).get().then(platillo=>{
                              if(platillo.exists){
                                  pedidos.add({email:email,
                                    platillo:item,
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
                                    if(Object.keys(carrito).length===0){
                                        save(email,carrito)
                                        res.send({status:true,data:"Carrito procesado"})
                                        return
                                    }
                                  }).catch(err => {save(email,carrito);res.send({status:false,data:"Error procesando un pedido"});return})
                              }
                              else {save(email,carrito);res.send({status:false,data:"Uno de los platillos del carrito no existe"})}
                          }).catch(err => {save(email,carrito);res.send({status:false,data:"Error procesando un pedido"})})
                      })
                }
                else
                    res.send({status:false,data:"El usuario solicitado no existe"})
            })
        }
    }
    else
        res.send({status:false,data:'Metodo invalido'})
})

const filtroPedidos = functions.https.onRequest((req, res) => {
    if(req.method==='GET'){
        const restaurante = req.query.keyRest
        const estado = req.query.estado
        const email = req.query.email
        let pagina = parseInt(req.query.pagina)
        if (pagina<1 || isNaN(pagina))
            pagina=1
        let query = pedidos
        if(restaurante!==undefined)
            query=query.where('restaurante','==',restaurante)
        if(estado!==undefined)
            query=query.where('estado.proceso','==',estado)
        if(email!==undefined)
            query=query.where('email','==',email)
        query.orderBy('fecha')
        query.get().then(items => {
            if (items.docs.length<=(pagina-1)*10)
                res.send({status:true,data:[[],0]})
            const pedRich = []
            const len = (items.docs.length-((pagina-1)*10))>10?10:(items.docs.length-((pagina-1)*10))
            let c = 0;
            for (let x=(pagina-1)*10;x<items.docs.length;x++){
                pedRich[c]= items.docs[x].data()
                pedRich[c]["id"]=items.docs[x].id
                c++;
                if (c===len){
                    res.send({status:true,data:[pedRich,Math.floor(items.docs.length/10)+(items.docs.length%10!==0?1:0)]})
                }
            }
        }).catch(err => {res.send({status:false,data:"Error obteniendo pedidos"})})
    }
    else
        res.send({status:false,data:"Metodo no reconocido"})
})

const verCarrito = functions.https.onRequest((req, res) => {
    if(req.method==='GET'){
        const email = req.query.email
        if(email===undefined){
            res.send({status:false,data:"Falta email"})
            return;
        }
        else
        usuarios.doc(email).get().then(usuario => {
            if(usuario.exists){
                const carrito = usuario.data().carrito
                const carritoRich=[]
                const keys = new Array();
                for(const key in carrito){console.log(key)
                    keys.push(key)
                }
                if(keys.length===0)
                  res.send({status:true,data:[]})
                else{
                  keys.forEach(key =>{
                      platillos.doc(key).get().then(platillo => {
                          restaurantes.doc(platillo.data().restaurante).get().then(rest =>{
                              carritoRich.push({
                                  clave:key,
                                  nombre:platillo.data().nombre,
                                  descripcion:platillo.data().descripcion,
                                  cantidad:carrito[key].cantidad,
                                  precio:platillo.data().precio,
                                  imagen: platillo.data().imagen,
                                  fecha:carrito[key].fecha,
                                  ubicacion:carrito[key].ubicacion,
                                  restaurante:[platillo.data().restaurante,rest.data().nombre]})
                              if(keys.length===carritoRich.length)
                                  res.send({status:true,data:carritoRich})
                          }).catch(err => {res.send({status:false,data:"Error obteniendo restaurante"})})
                      }).catch(err => {
                        console.log(err);
                        res.send({status:false,data:"Error obteniendo platillos"})})
                  })
                }
            }
            else
                res.send({status:false,data:"El usuario no existe"})
        }).catch(err => {res.send({status:false,data:"Error obteniendo el usuario"})})
    }
    else
        res.send({status:false,data:"Metodo no reconocido"})
})

const setEstado = functions.https.onRequest((req, res) => {
    if(req.method==='POST'){
        const keyPedido = req.body.pedido
        const proceso = req.body.proceso
        const razon = req.body.razon
        if(keyPedido===undefined || proceso==="pendiente" || (proceso==="rechazado" && razon === undefined) || proceso===undefined || (proceso!=="aprobado" && proceso!=="rechazado"&&proceso!=="finalizado"))
            res.send({status:false,data:"Datos no validos"})
        else{
            pedidos.doc(keyPedido).get().then(pedido => {
                if(pedido.exists){
                    const pEstado=pedido.data().estado.proceso
                    if(pEstado==="pendiente" && proceso==="finalizado")
                        res.send({status:false,data:"No se puede finalizar un producto pendiente"})
                    else if(pEstado==="rechazado" || pEstado==="finalizado")
                        res.send({status:false,data:"No se puede modificar el estado \"rechazado\" ni \"finalizado\""})
                    else{
                        pedidos.doc(keyPedido).set({estado:{proceso:proceso,razon:razon===undefined?"":razon}},{merge:true})
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

const subirImagenPlat = functions.https.onRequest((req, res) => {
    if (req.method === 'POST') {
        const keyPlat=req.body.keyPlat //clave de platillo
        let img = req.body.img //base64
        const url = req.body.url //url
        if(!isUndefined(img) && !isUndefined(url)){
            res.send({status:false,data:"Solo puede enviar URL o IMG, no ambos"})
            return
        }
        else if(keyPlat===undefined)
            res.send({status:false,data:"Platillo no recibido"})
        else if (url!==undefined){
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
        else if(img===undefined){
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
                if(img===undefined){
                    res.send({status:false,data:"Archivo invalido"})
                    return
                }
                else if(img.type!=='image'){
                    res.send({status:false,data:"El archivo enviado no es una imagen valida"})
                    return
                }
                else{
                    const fileName = keyPlat+'.'+img.extension
                    const file = bucket.file('platillos/' + fileName);
                    file.save(
                        img.file,
                        {metadata: {contentType: img.mime}},
                        error => {
                            if (error)
                                res.send({status:false,data:'No se pudo subir la imagen.'});
                            else{
                                const URL = file.metadata.mediaLink
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

const setUsuario = functions.https.onRequest((req, res) => {
    if (req.method === 'POST')
        if(isUndefined(req.body.email) || (req.body.override && (isUndefined(req.body.nombre) || isUndefined(req.body.telefono))))
            res.send({status:false,data:"Faltan datos"})
        else{
            let ubicacion
            if(req.body.ubicacion!==undefined || !req.body.override)
              try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
              catch(e){
                try{
                  ubicacion = genGeopoint(JSON.parse(JSON.stringify(req.body.ubicacion)),false);
                } catch(err){
                  console.log(err);
                  res.send({status:false,data:"Error interpretando la ubicación"});return}
              }
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!re.test(String(req.body.email).toLowerCase()))
              res.send({status:false,data:"Correo no valido"})
            else if(ubicacion===undefined && !req.body.override)
              res.send({status:false,data:"ubicación invalida"})
            else{
                usuarios.doc(req.body.email).get().then(snapshot => {
                    if(snapshot.exists && !(req.body.override))
                        res.send({status:false,data:"Este correo electronico ya está registrado"})
                    else{
                        try{
                          let usuario: any;
                          if(req.body.nombre!==undefined)
                            usuario= {nombre:req.body.nombre};
                          if(req.body.telefono!==undefined)
                            usuario.telefono = req.body.telefono;
                          if(ubicacion!==undefined)
                            usuario.ubicacion = ubicacion;
                          usuarios.doc(req.body.email).set(usuario,{merge:true})
                          res.send({status:true,data:`Bienvenido${req.body.override?' de vuelta':''}, ${req.body.nombre}` })
                        }catch(e){res.send({status:false,data:`Error insertando usuario: ${JSON.stringify(e)}`})}
                    }
                }).catch(err => {res.send({status:false,data:"Error obteniendo datos de servidor"})})
            }
        }
    else
        res.send({status:false,data:"Este endpoint solo admite POST"})
})

const setTarjeta = functions.https.onRequest((req, res) => {
    const codigo = req.body.codigo
    const numero = req.body.numero
    const exp = req.body.exp
    const dueño = req.body.dueño
    const proveedor = req.body.proveedor
    const email = req.body.email
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

const addRestaurante = functions.https.onRequest((req, res) => {
    if(req.method==='POST'){
        const nombre = req.body.nombre
        const empresa = req.body.empresa
        const descripcion = req.body.descripcion
        let ubicacion = req.body.ubicacion
        const horario = getHorario(req.body.horario)
        const email = req.body.email
        if(!allDefined([nombre,email,empresa,descripcion,ubicacion[0],ubicacion[1],horario])){
            res.send({status:false,data:"Faltan Datos"})
            return
        }
        else{
            try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
            catch(e){
              try{
                ubicacion = genGeopoint(JSON.parse(JSON.stringify(req.body.ubicacion)),false);
              } catch(err){
                console.log(err);
                res.send({status:false,data:"Error interpretando la ubicación"});return}
            }
            if(horario===undefined)
              res.send({status:false,data:"Formato de horario no valido, debe tener este formato {d:[{init:minutos,end:minutos}],l:[{init:minutos,end:minutos}],k:[{init:minutos,end:minutos}],m:[{init:minutos,end:minutos}],j:[{init:minutos,end:minutos}],v:[{init:minutos,end:minutos}],s:[{init:minutos,end:minutos}]}"})
            else if(ubicacion===undefined)
              res.send({status:false,data:"Ubicacion no valida"})
            else{
                usuarios.doc(email).get().then(user =>{
                    if(user.exists){
                        const data = {
                            nombre: nombre,
                            empresa:empresa,
                            descripcion:descripcion,
                            horario:horario,
                            ubicacion:ubicacion}
                        restaurantes.add(data).then(ref =>{
                            const rests = user.data().restaurantes===undefined?[]:user.data().restaurantes
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

const modRestaurante = functions.https.onRequest((req, res) => {
    if(req.method==='POST'){
        const nombre = req.body.nombre
        const empresa = req.body.empresa
        const descripcion = req.body.descripcion
        let ubicacion = req.body.ubicacion
        const horario = getHorario(req.body.horario)
        console.log(getHorario(req.body.horario))
        const keyRest = req.body.keyRest
        if(!allDefined([nombre,empresa,descripcion,ubicacion[0],ubicacion[1],horario,keyRest]))
            res.send({status:false,data:"Faltan Datos"})
        else{
            try{ubicacion = genGeopoint(JSON.parse(req.body.ubicacion),false)}
            catch(e){
              try{
                ubicacion = genGeopoint(JSON.parse(JSON.stringify(req.body.ubicacion)),false);
              } catch(err){
                console.log(err);
                res.send({status:false,data:"Error interpretando la ubicación"});return}
            }
            if(horario===undefined)
              res.send({status:false,data:"Formato de horario no valido, debe tener este formato {d:[{init:minutos,end:minutos}],l:[{init:minutos,end:minutos}],k:[{init:minutos,end:minutos}],m:[{init:minutos,end:minutos}],j:[{init:minutos,end:minutos}],v:[{init:minutos,end:minutos}],s:[{init:minutos,end:minutos}]}"})
            else if(ubicacion===undefined)
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

const subirImagenRest = functions.https.onRequest((req, res) => {
    if (req.method === 'POST') {
        const keyRest=req.body.keyRest //clave de platillo
        let img = req.body.img //base64
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
                if(img===undefined){
                    res.send({status:false,data:"Archivo invalido"})
                    return
                }
                else if(img.type!=='image'){
                    res.send({status:false,data:"El archivo enviado no es una imagen valida"})
                    return
                }
                else{
                    const fileName = keyRest+'.'+img.extension
                    const file = bucket.file('restaurantes/' + fileName);
                    file.save(
                        img.file,
                        {metadata: {contentType: img.mime}},
                        error => {
                            if (error)
                                res.send({status:false,data:'No se pudo subir la imagen.'});
                            else{
                                const URL = file.metadata.mediaLink
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

const calificar = functions.https.onRequest((req,res) => {
  if (req.method === "POST"){
    const keyPlat = req.body.keyPlat;
    const stars = parseInt(req.body.stars)
    const review = req.body.review===undefined?"":req.body.review
    const email = <String> req.body.email
    if (stars<0 || stars>5)
      res.send({status:false,data:"Solo puedes calificar de 0 a 5 estrellas"})
    else if(keyPlat!==undefined && email!==undefined && !isNaN(stars)){
      platillos.doc(keyPlat).get().then(plat => {
        if(plat.exists)
          usuarios.doc(email).get().then(user =>{
            if(user.exists){
              pedidos
              .where("email","==",email)
              .where("nombre","==",plat.data().nombre)
              .where("restaurante","==",plat.data().restaurante)
              .get().then(peds =>{
                if(!peds.empty){
                  const update = {}
                  update[`calificaciones.${email.split(".")[0]}`] = {stars:stars,review:review}
                  platillos.doc(keyPlat).update(update)
                  res.send({status:true,data:`Has calificado ${plat.data().nombre} con ${stars} estrellas
                  Comentario: "${review}"`})
                }
                else
                  res.send({status:false,data:"No has comprado este platillo"})
              })
            }
            else
              res.send({status:false,data:"El usuario solicitado no existe"})
          }).catch(error =>{
            console.log(error);
            res.send({statu:false,data:"Error obteniendo el usuario"})})
        else
          res.send({status:false,data:"El platillo solicitado no existe"})
      }).catch(e =>res.send({status:false,data:"Error obteniendo platillo" + JSON.stringify(e)}))
    }
    else
      res.send({status:false,data:"No se han recibido los valores necesarios"})
  }
  else
    res.send({status:false,data:"Este endPoint solo acepta POST"})
})

const limpiarPedidos = functions.https.onRequest((req,res) => {
  if (req.method === "POST"){
    const keyRest = req.body.keyRest
    pedidos
    .where("restaurante","==",keyRest)
    .where("estado.proceso","==","pendiente")
    .where("fecha","<",new Date())
    .get()
    .then(exp =>{
      let c = 0;
      exp.forEach(p=>{
        c++
        pedidos.doc(p.id).update({estado:{proceso:"rechazado",razon:"El pedido no fué procesado y ha expirado"}})
      })
      res.send({status:true,data:`Se han limpiado ${c} pedidos expirados`})
    })
    .catch(error =>{
      console.log(error)
      res.send({status:false,data:"Error de consulta"})
    })
  }
  else
    res.send({status:false,data:"Este endPoint solo acepta POST"})
})

const getUser = functions.https.onRequest((req,res) => {
  if (req.method === "GET"){
    const email = req.query.email
    if(email === "" || isUndefined(email))
      res.send({status:false,data:'Email invalido'});
    else
      usuarios.doc(email)
      .get()
      .then(user =>{
        if(user.exists){
          const userData = user.data();
          userData.exists = true;
          res.send({status:true,data:userData});
        }
        else
          res.send({status:true,data:{}});
      })
      .catch(error =>{
        console.log(error)
        res.send({status:false,data:"Error de consulta"})
      })
  }
  else
    res.send({status:false,data:"Este endPoint solo acepta GET"})
})

const getRests = functions.https.onRequest((req,res) => {
  if (req.method === "GET"){
    const email = req.query.email
    if(email === "" || isUndefined(email))
      res.send({status:false,data:'Email invalido'});
    else
      usuarios.doc(email)
      .get()
      .then(user =>{
        if(user.exists){
          const rests = user.data().restaurantes;
          const restsRich = [];
          let c = 0;
          let d = 0;
          for(let x = 0; rests[x]!==undefined;x++) {
            c++;
            restaurantes.doc(rests[x]).get()
            .then(restInfo => {
              console.log(restInfo.data())
              if (restInfo.exists){
                restsRich[x] = restInfo.data();
                restsRich[x].id = rests[x];
              } else {
                restsRich[x] = {};
                restsRich[x].id = rests[x];
              }
              if (restsRich[x].imagen===undefined)
                restsRich[x].imagen="https://cdn3.iconfinder.com/data/icons/food-drink/512/Dining-512.png"
              d++;
              if(c===d){
                res.send({status:true,data:restsRich})
              }
            })
            .catch(err => {
              console.log(err);res.send({status:false,data:`Error procesando restaurante ${rests[x]}`});return;
            })
          }
        }
        else
          res.send({status:true,data:{}});
      })
      .catch(error =>{
        console.log(error)
        res.send({status:false,data:"Error de consulta"})
      })
  }
  else
    res.send({status:false,data:"Este endPoint solo acepta GET"})
})

app.get('/api/filtroPlat', filtroPlat);
app.get('/api/categoria', categoria);
app.get('/api/filtroPedidos', filtroPedidos);
app.get('/api/verCarrito', verCarrito);
app.get('/api/getUser', getUser);
app.get('/api/getRests', getRests);
app.get('/api/genGeopoint', (req,res) => {res.send({status:true,data:genGeopoint([parseInt(req.query.lat),parseInt(req.query.lng)],true)})});
app.post('/api/setEstado', setEstado);
app.post('/api/subirImagenPlat', subirImagenPlat);
app.post('/api/setUsuario', setUsuario);
app.post('/api/setTarjeta', setTarjeta);
app.post('/api/addRestaurante', addRestaurante);
app.post('/api/modRestaurante', modRestaurante);
app.post('/api/subirImagenRest', subirImagenRest);
app.post('/api/calificar', calificar);
app.post('/api/limpiarPedidos', limpiarPedidos);
app.post('/api/addPlatillo', addPlatillo);
app.post('/api/modPlatillo', modPlatillo);
app.post('/api/delPlatillo', delPlatillo);
app.post('/api/itemCarro', itemCarro);
app.post('/api/delCarro', delCarro);
app.post('/api/caja', caja);

export const api = functions.https.onRequest(app);
