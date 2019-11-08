const {config} = require('./config');
const admin = require('firebase-admin');
admin.initializeApp(config);
const db = admin.firestore();

module.exports = { admin, db }