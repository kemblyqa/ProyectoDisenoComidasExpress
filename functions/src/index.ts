import * as functions from 'firebase-functions';

const async = require('async')
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

var usuarios = db.collection("Usuario");
var categorias = db.collection("Categoria");
var restaurantes = db.collection("Restaurante");
var pedidos = db.collection("Pedido");

export const categoria = functions.https.onRequest((request, response) => {
    if (request.method=="GET"){
        categorias.get()
        .then((snapshot) => {
            var catIDs = [];
            snapshot.forEach((doc) => {
                catIDs.push(doc.id);
            });
            response.send({status:true,data:catIDs});
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
        categorias.doc(request.body.categoria).get()
        .then((snapshot) => {
            if(!snapshot.exists)
                response.send({status:false,data:'Esta categoria no existe'});
            var platList = [];
            for(let x=0;snapshot.data().platillos[x]!=undefined;x++){
                snapshot.data().platillos[x].Restaurante.get()
                .then((Restaurante) => {
                    var res;
                    if(!Restaurante.exists)
                        res="Desconocido"
                    else
                        res={nombre:Restaurante.data().nombre,id:Restaurante.id};
                    platList.push({
                        imagen:snapshot.data().platillos[x].imagen,
                        descripcion:snapshot.data().platillos[x].descripcion,
                        nombre:snapshot.data().platillos[x].nombre,
                        Restaurante:res})
                    if(snapshot.data().platillos[x+1]==undefined)
                        response.send({status:true,data:platList});
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
