const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const express = require('express');
const app = express();

admin.initializeApp();

app.get('/screams', (request, response) => {
    admin
    .firestore()
    .collection('screams')
    .get()
    .then( (data) => {
        let screams = [];
        data.forEach( (doc) => {
            screams.push(doc.data())
        });
        return response.json(screams);
    })
    .catch( (err) => console.error(err));
})

// exports.getScreams = functions.https.onRequest( (request, response) => {
//     admin
//     .firestore()
//     .collection('screams')
//     .get()
//     .then( (data) => {
//         let screams = [];
//         data.forEach( (doc) => {
//             screams.push(doc.data())
//         });
//         return response.json(screams);
//     })
//     .catch( (err) => console.error(err));
// })

app.post('/scream', (request, response) => {
    // if (request.method !== 'POST') {
    //     return response.status(400).json({ error: 'Method not allowed' });
    // }
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then( (doc) => {
        response.json({ message: `document ${doc.id} created successfully`})
    })
    .catch( (err) => {
        response.status(500).json({ error: "something went wrong 6" });
        console.error(err);
    });
});

// we want to have this style
// https://baseurl/api/...

exports.api = functions.https.onRequest(app);