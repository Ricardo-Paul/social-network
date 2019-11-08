const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const app = require('express')();
admin.initializeApp();
const db = admin.firestore();



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
    db
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
});












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








const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}














// SignUp route
app.post('/signup', (request, response) =>{
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    // TODO: validate data
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return response.status(400).json({message: 'handle taken'})
        } else{
           return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
       return data.user.getIdToken();
    })
    .then(token =>{
        return response.status(201).json({token})
    })
    .catch(err =>{
        console.error(err.code)
    })
});












// Ensure you get the user token everytime they login
// data (the promise) data.user.getIdToken

exports.api = functions.https.onRequest(app);