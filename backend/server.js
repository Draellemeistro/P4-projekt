import express from 'express';
import getEmailRoute from './routes/get-email.js';
import fetchCandidatesRoute from './routes/fetch-candidates.js';
import verify2faRoute from './routes/verify-2fa.js';
import insertBallotRoute from './routes/insert-ballot.js';
import handleEncryptedBallotRoute from './routes/handle-encrypted-ballot.js';
import agreeSharedSecretRoute from './routes/agree-shared-secret.js';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { createECDH } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // for some reason this is needed to get the current directory


const app = express();

app.use(express.json());
app.use(cors({}));

app.use('/get-email', getEmailRoute);
app.use('/fetch-candidates', fetchCandidatesRoute);
app.use('/verify-2fa', verify2faRoute);

app.use('/rsa-to-ecdh-test')
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



