"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
exports.helloWorld = functions.https.onRequest((request, response) => {
    if (request.method == "POST") {
        admin.firestore().collection('Restaurantes').add(request.body).then(writeResult => {
            // write is complete here
        });
    }
    response.send({ msg: "Hello from Firebase!" });
});
//# sourceMappingURL=index.js.map