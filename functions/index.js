const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Sample Firebase Function
exports.fetchLogs = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  
  try {
    const snapshot = await db.collection('Maintenance_Logs').where('status', '==', 'Complete').get();
    if (snapshot.empty) {
      res.status(200).send('No completed logs found.');
      return;
    }

    let logs = [];
    snapshot.forEach(doc => {
      logs.push(doc.data());
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs: ', error);
    res.status(500).send('Internal Server Error');
  }
});

