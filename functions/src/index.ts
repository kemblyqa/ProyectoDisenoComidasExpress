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
        let query = platillos
        if(categoria!=undefined)
            query=query.where('categoria','==',categoria)
        if(keyRest!=undefined)
            query=query.where('restaurante','==',keyRest)
        if(nombre!=undefined)
            query=query.where('nombre','==',nombre)
        query.get()
        .then((snapshot) => {
            var platList = [];
            snapshot.forEach(element => {
                platList.push(element.data())
            });
            if (platList.length==0)
                response.send({status:true,data:[]})
            let platRich = []
            for (let x=0;platList[x]!=undefined;x++){
                restaurantes.doc(platList[x].restaurante).get().then((Restaurante) => {
                    var res;
                    if(!Restaurante.exists)
                        res="Desconocido"
                    else
                        res={nombre:Restaurante.data().nombre,id:Restaurante.id};
                    platRich.push({
                        imagen:platList[x].imagen,
                        descripcion:platList[x].descripcion,
                        nombre:platList[x].nombre,
                        Restaurante:res})
                    if(platList[x+1]==undefined)
                        response.send({status:true,data:platRich});
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
        let keyRest = request.body.keyRest
        let categoria = request.body.categoria
        let nombre = request.body.nombre
        if (descripcion==undefined || imagen==undefined||keyRest==undefined||categoria==undefined||nombre==undefined)
            response.send({status:false,data:"Falta un dato"})
        platillos.where('restaurante','==',keyRest).where('nombre','==',nombre).get().then(snapshot => {
            if(!snapshot.empty)
                response.send({status:false,data:"Este platillo ya existe en este restaurante"})
                restaurantes.doc(keyRest).get().then(snapshot2 =>{
                    if(!snapshot2.exists)
                        response.send({status:false,data:"El restaurante no existe"})
                    platillos.add({restaurante:keyRest,imagen:imagen,categoria:categoria,descripcion:descripcion,nombre:nombre}).then(ref =>{
                        response.send({status:true,data:ref.id})
                })
            }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
        }).catch(err=>{response.send({status:false,data:"Error insertando platillo"})})
    }
    else
        response.send({status:false,data:'Metodo no encontrado'})
})