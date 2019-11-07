const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const app = require('express')();
admin.initializeApp();


// ---- Adding firebase to our app
const config = {
    apiKey: "AIzaSyCVDFsCccFAebluJ5O1s51A9QP3YknOVic",
    authDomain: "socialape-eaef4.firebaseapp.com",
    databaseURL: "https://socialape-eaef4.firebaseio.com",
    projectId: "socialape-eaef4",
    storageBucket: "socialape-eaef4.appspot.com",
    messagingSenderId: "370403092046",
    appId: "1:370403092046:web:7d91c05024d801bdc3c51f",
    measurementId: "G-VX91V8X0T2"
  };

//   after installing firebase inside funcitons folder
// npm install --save firebase
const firebase = require('firebase');
firebase.initializeApp(config);


app.get('/screams', (request, response) => {
    admin
    .firestore()
    .collection('screams')
    .orderBy( 'createdAt', 'desc' )
    .get()
    .then( (data) => {
        let screams = [];
        data.forEach( (doc) => {
            screams.push(
                // doc.data()
                // reshape the output of the json using the doc id and data()
                {
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                }
            );
        });
        return response.json(screams);
    })
    .catch( (err) => console.error(err));
})

app.post('/scream', (request, response) => {
    // if (request.method !== 'POST') {
    //     return response.status(400).json({ error: 'Method not allowed' });
    // }
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        // createdAt: admin.firestore.Timestamp.fromDate(new Date())
        createdAt: new Date().toISOString()
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


// SignUp route
app.post( '/signup', (request, response) =>{
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle
    }

// Now using firebase to authenticate user
firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
        return response.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
    })
    .catch( (err) =>{
        console.error(err);
        return response.status(500).json({error: 'an error has occured'})
    })
})

exports.api = functions.https.onRequest(app);