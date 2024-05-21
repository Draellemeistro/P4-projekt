const express = require('express');
const getEmailRoute = require('./routes/handleUserAuthentication.js');
const fetchCandidatesRoute = require('./routes/fetch-candidates.js');
const { verify2faRoute, handleVerify2FA } = require('./routes/verify-2fa');
const { handleEncryptedBallotRoute, handleEncryptedBallot } = require('./routes/handle-encrypted-ballot.js');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ServerECDH = require('./utils/cryptoFunctions/serverECDH');
const ServerRSA = require('./utils/cryptoFunctions/serverRSA');
const { loadAllKeys, allKeysAreLoaded } = require('./utils/keyUsage.js');






const app = express();

app.use(helmet.hsts({ // Use helmet.hsts middleware
	maxAge: 1800, // One year in seconds
	includeSubDomains: true,
	preload: true
}));

// Create a credentials object
app.use(express.json());
app.use(cors({}));


if(!allKeysAreLoaded()) {
	console.log('All keys are already loaded');
} else {
	loadAllKeys().then(r => {
		console.log(r);
	});
}




app.use('/get-email', getEmailRoute);
app.use('/fetch-candidates', fetchCandidatesRoute);
app.use('/verify-2fa', verify2faRoute);
app.use('/handle-encrypted-ballot', handleEncryptedBallotRoute);



const privateKey = fs.readFileSync('/etc/letsencrypt/live/agora.servernux.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/agora.servernux.com/fullchain.pem', 'utf8');
// Create a credentials object for use with https

const credentials = {
	key: privateKey,
	cert: certificate,
	secureProtocol: 'TLSv1_2_method' // Use TLS 1.2
};



app.use(express.static(path.join(__dirname, '../Agora-app/build')));
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../Agora-app/build/index.html'));
	console.log('Static file server is running'); // Add this line
});
//app.listen(80, () => console.log('HTTP Server started')); // TODO wepcrypto kræver at vi bruger https
https.createServer(credentials, app).listen(443);



