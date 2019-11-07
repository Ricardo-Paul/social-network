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
const db = admin.firestore();


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
let token, userId;
app.post( '/signup', (request, response) =>{
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle
    }

    let errors = {};
    if(isEmpty(newUser.email)){
        errors.email = 'Email must not be empty'
    } else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email adress'
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must watch';

    if(Object.keys(errors).length > 0) return response.status(400).json(errors);
    

    // validate
    db.doc(`/users/${newUser.handle}`).get()
    .then( doc => {
        if(doc.exixts){
            return response.status(400).json({ handle: 'this handle is already taken' })
        }else {
           return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        // now we have our user created
        userId = data.user.uid;
       return data.user.getIdToken();
       console.log(data)
    })
    .then(token => {
        token = token;
        // return response.status(201).json({ token  });
        const userCredentials = {
            handle: newUser.handle,
            email: newUser.email,
            createdAt: new Date.toISOString(),
            userId
        };
        // this will programmatically create the users collection in the database
        db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then( () => {
        return response.status(201).json({ token });
    })
    .catch(err => {
        console.error(err);
        if (err.code = 'auth/email-already-in-use'){
            return response.status(400).json({ email: 'email is already in use' })
        } else {
            return response.status(500).json({error: err.code });
        }
    });
});






// Login 
app.post('/login', (request, response) =>{
    const user = {
        email: request.body.email,
        password: request.body.password
    };

    let errors = {};

    if(isEmpty(user.email)) errors.email = "Must not be empty";
    if(isEmpty(user.password)) errors.password = "Must not be empty";

    if(Object.keys(errors).length > 0) return response.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then( data => {
        return data.user.getIdToken();
    })
    .then(token =>{
        return response.json({token})
    })
    .catch(err => {
        if(err.code === "auth/wrong-password"){
            response.status(403).json({ error: 'wrong password please try again' })
        }
        console.error(err);
        return response.status(500).json({ errror: err.code })
    });
});

// Ensure you get the user token everytime they login
// data (the promise) data.user.getIdToken

exports.api = functions.https.onRequest(app);