import * as functions from 'firebase-functions';

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
export const helloWorld = functions.https.onRequest((request, response) => {
    if (request.method=="POST"){
        admin.firestore().collection('Restaurantes').add(request.body).then(writeResult => {
            // write is complete here
        });
    }
    response.send({msg:"Hello from Firebase!"});
});
