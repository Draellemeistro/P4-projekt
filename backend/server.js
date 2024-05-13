const express = require('express');
const getEmailRoute = require('./routes/get-email.js');
const fetchCandidatesRoute = require('./routes/fetch-candidates.js');
const verify2faRoute = require('./routes/verify-2fa.js');
const insertBallotRoute = require('./routes/insert-ballot-untouched.js');
const handleEncryptedBallotRoute = require('./routes/handle-encrypted-ballot.js');
const agreeSharedSecretRoute = require('./routes/agree-shared-secret.js');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const serverRSA = require('./utils/cryptoFunctions/serverRSA.js');
const serverECDH = require('./utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('./utils/cryptoFunctions/serverDigitalSignatures.js');
 serverECDH.readKeysFromFiles();
 serverRSA.readKeysFromFiles();
 serverDigSig.readKeysFromFiles();



const app = express();

// Create a credentials object
app.use(express.json());
app.use(cors({
	origin: '192.168.0.113', // Update with your frontend URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}));







app.use('/get-email', getEmailRoute);
app.use('/fetch-candidates', fetchCandidatesRoute);
app.use('/verify-2fa', verify2faRoute);
app.use('/insert-ballot', insertBallotRoute);
app.use('/handle-encrypted-ballot', handleEncryptedBallotRoute);
app.use('/agree-shared-secret', agreeSharedSecretRoute);

const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');
// Create a credentials object for use with https

const credentials = {
	key: privateKey,
	cert: certificate,
	secureProtocol: 'TLSv1_2_method' // Use TLS 1.2
};
const serverLocal = https.createServer(credentials, app).listen(3030, () => console.log('HTTPs Server started'));
console.log(`Server listening at https://${serverLocal.address().address}:${serverLocal.address().port}`);


app.use(express.static(path.join(__dirname, '../Agora-app/build')));
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../Agora-app/build/index.html'));
	console.log('Static file server is running'); // Add this line
});

//https.createServer(credentials, app).listen(443);



