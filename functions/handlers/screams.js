const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });
      return res.json(screams);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// post One scream
exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),

    likeCount: 0,
    commentCount: 0
  };

  db.collection('screams')
    .add(newScream)
    .then((doc) => {
      const resScream = newScream;
      resScream.screamId = doc.id;
      res.json(resScream);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};

// fetch one scream
exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};


// comment on scream
exports.commentOnScream = (req, res) => {
  if(req.body.body.trim() === '') return res.status(500).json({error: 'must not be empty'});
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({ error: 'Scream not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then( () =>{
      return db.collection('comments').add(newComment);
    })
    .then(() =>{
      //white result vs document reference
      // return the comment to the user to add it on the user interface
      res.json({newComment})
    })
    .catch( err => {
      res.status(500).json({error: 'Something went wrong'});
    })
};

// like a scream
exports.likeScream = (req, res) => {
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
  .where('screamId', '==', req.params.screamId).limit(1);

  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData;
  screamDocument.get()
    .then(doc =>{
      if (doc.exists){
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({error: "scream not found"});
      }
    })
    // query snapshot
    .then(data => {
      if (data.empty){
        // each like is a document, if we didn't have the like so we can create it
        return db.collection('likes').add({
          screamId: req.params.screamId,
          userHandle: req.user.handle
        })
        .then( () =>{
          screamData.likeCount++
          return screamDocument.update({ likeCount: screamData.likeCount });
        })
        .then( () => {
          return res.json(screamData);
        })
      } else {
        return res.status(400).json({error: 'scream already liked'})
      }
    })
    .catch (err => {
      res.status(500).json({error: err.code});
    })
};

exports.unlikeScream = (req, res) => {
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
  .where('screamId', '==', req.params.screamId).limit(1);

  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData;

  screamDocument.get()
    .then(doc =>{
      if (doc.exists){
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({error: "scream not found"});
      }
    })
    // query snapshot
    .then(data => {
      if (data.empty){
        return res.status(400).json({error: 'You have not liked this scream'})
        // you're trying to unlike a scream that you haven't liked
      } else {
        // We are deleting the like document
        // and we are decrementing the like count property in the screamData
        return db.doc(`/likes/${data.docs[0].id}`).delete()
          .then( () =>{
            screamData.likeCount--;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(()=>{
            res.json(screamData)
          })
      }
    })
    .catch (err => {
      res.status(500).json({error: err.code});
    });
};

// Delete Scream
exports.deleteScream = (req, res) => {
  const document = db.doc(`/screams/${req.params.screamId}`);
  document.get()
    .then(doc => {
      if (!doc.exists){
        return res.status(404).json({error: 'Scream not found'});
      }
      if (doc.data().userHandle !== req.user.handle){
        res.status(403).json({error: 'Deletion access denied'})
      } else {
        document.delete();
      }
    })
    .then( () =>{
      res.json({ message: 'Scream deleted Sucessfully' })
    })
    .catch(err =>{
      console.error(err);
      return res.status(500).json({ error: err.code });
    })
}