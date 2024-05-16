const express = require('express');
const getEmailRoute = require('./routes/get-email.js');
const fetchCandidatesRoute = require('./routes/fetch-candidates.js');
const verify2faRoute = require('./routes/verify-2fa.js');
const handleEncryptedBallotRoute = require('./routes/handle-encrypted-ballot.js');
const requestServerKeysRoute = require('./routes/request-server-keys.js');
const signMsgRoute = require('./routes/sign-msg.js');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ServerECDH = require('./utils/cryptoFunctions/serverECDH');
const ServerRSA = require('./utils/cryptoFunctions/serverRSA');
const { loadKeys: loadKeysRSA } = require('./utils/cryptoFunctions/serverRSA');
const { loadKeys: loadKeysDigSig } = require('./utils/cryptoFunctions/ServerDigSig');





const app = express();

// Create a credentials object
app.use(express.json());
app.use(cors({}));


ServerRSA.loadKeys().then(() => {
	console.log('RSA Keys loaded');
});
ServerECDH.loadKeys().then(() => {
	console.log('ECDH Keys loaded');
});
loadKeysDigSig().then(() => {
	console.log('DigSig Keys loaded');
});




app.use('/get-email', getEmailRoute);
app.use('/fetch-candidates', fetchCandidatesRoute);
app.use('/verify-2fa', verify2faRoute);
app.use('/handle-encrypted-ballot', handleEncryptedBallotRoute);
app.use('/request-server-keys', requestServerKeysRoute);
app.use('/sign-msg', signMsgRoute);


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



