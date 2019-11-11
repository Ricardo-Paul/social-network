const functions = require('firebase-functions');

const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');

const { getAllScreams,
        postOneScream, 
        getScream, 
        commentOnScream,
        likeScream,
        deleteScream,
        unlikeScream } = require('./handlers/screams');
const { 
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    } = require('./handlers/users');

// Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream); // returns the scream including its comments
app.delete('/scream/:screamId', FBAuth, deleteScream)
// TODO: delte scream
// TODO: like a scream
// TODO: unlike a scream
// TODO:comment on a scream
 
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

// users routes
app.post('/signup', signup);
app.post('/login', login);

app.post('/user/image', uploadImage);
app.post('/user', FBAuth, addUserDetails ); //add user details 
app.get('/user', FBAuth, getAuthenticatedUser);  //get user details

exports.api = functions.region('europe-west1').https.onRequest(app);


exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

  exports.deleteNotificationOnUnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
// export GOOGLE_APPLICATION_CREDENTIALS="/home/ricardo/Videos/React Social/socialape-03074a244dce.json"