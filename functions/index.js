const functions = require('firebase-functions');
const app = require('express')();

const config = {
      apiKey: "AIzaSyCVDFsCccFAebluJ5O1s51A9QP3YknOVic",
  authDomain: "socialape-eaef4.firebaseapp.com",
  databaseURL: "https://socialape-eaef4.firebaseio.com",
  projectId: "socialape-eaef4",
  storageBucket: "socialape-eaef4.appspot.com",
  messagingSenderId: "370403092046"
}

// const firebase = require('firebase');
// firebase.initializeApp(config);

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');

const FBAuth = (req, res, next) => {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
      console.error('No token found');
      return res.status(403).json({ error: 'Unauthorized' });
    }
  
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        console.log(decodedToken);
        return db
          .collection('users')
          .where('userId', '==', req.user.uid)
          .limit(1)
          .get();
      })
      .then((data) => {
        req.user.handle = data.docs[0].data().handle;
        return next();
      })
      .catch((err) => {
        console.error('Error while verifying token ', err);
        return res.status(403).json(err);
      });
  };


// Scream routes
app.get('/screams', getAllScreams );
app.post('/scream', FBAuth, postOneScream);


// Signup route
app.post('/signup', signup);

app.post('/login', login );

exports.api = functions.region('europe-west1').https.onRequest(app);

// firebase deploy --token "1//05sulePmimN4HCgYIARAAGAUSNwF-L9IrCD8P-43mCaBjKjnlRdh5tw00K0sQJVgQRY--6AYgTNRfqYdridSCEyvNuET18diLSI0"