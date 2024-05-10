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




const app = express();

app.use(express.json());
app.use(cors({}));

app.use('/get-email', getEmailRoute);
app.use('/fetch-candidates', fetchCandidatesRoute);
app.use('/verify-2fa', verify2faRoute);
app.use('/insert-ballot', insertBallotRoute);
app.use('/handle-encrypted-ballot', handleEncryptedBallotRoute);
app.use('/agree-shared-secret', agreeSharedSecretRoute);

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

//https.createServer(credentials, app).listen(443);
app.listen(80, () => console.log('HTTP Server started'));



