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

export const GetPlatillosC = functions.https.onRequest((request, response) => {
    if (request.method=="GET"){
        platillos.where('categoria','==',request.body.categoria).get()
        .then((snapshot) => {
            var platList = [];
            snapshot.forEach(element => {
                platList.push(element.data())
            });
            console.log(platList)
            let platRich = []
            for (let x=0;platList[x]!=undefined;x++){
                console.log(platList[x])
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

export const platillosRest = functions.https.onRequest((request, response) => {
    if (request.method=="GET"){
        platillos.where('restaurante','==',request.body.keyRest).get()
        .then((snapshot) => {;
            if(snapshot.empty)
                response.send({status:true,data:[]})
            var platList = [];
            snapshot.forEach(doc => {
                platList.push(doc.data())
            });
            response.send({status:true,data:platList})
        })
        .catch((err) => {
            response.send({status:false,data:'Error obteniendo documentos'});
        });
    }
    else
        response.send({status:false,data:'Solicitud desconocida'});
});