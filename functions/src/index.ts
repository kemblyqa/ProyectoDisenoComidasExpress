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
        let keyRes = request.query.keyRes
        let nombre = request.query.nombre
        let query = platillos
        if(categoria!=undefined)
            query=query.where('categoria','==',categoria)
        if(keyRes!=undefined)
            query=query.where('restaurante','==',keyRes)
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