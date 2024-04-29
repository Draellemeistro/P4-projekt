import express from 'express';
import getEmailRoute from './routes/get-email.js';
import fetchCandidatesRoute from './routes/fetch-candidates.js';
import verify2faRoute from './routes/verify-2fa.js';
import insertBallotRoute from './routes/insert-ballot.js';
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
app.use('/insert-ballot', insertBallotRoute);



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





// Change the paths to the keys to the correct paths on your server after moving out from project dir
// const serverPublicKeyECDH = fs.readFileSync(__dirname + '/serverPublicKeyECDH.pem', 'utf8');
// const serverPrivateKeyECDH = fs.readFileSync(__dirname + '/serverPrivateKeyECDH.pem', 'utf8');
// const serverPublicRSAKey = fs.readFileSync(__dirname + '/serverPublicKeyRSA.pem', 'utf8');
// const serverPrivateRSAKey = fs.readFileSync(__dirname + '/serverPrivateKeyRSA.pem', 'utf8');
// const serverECDH = createECDH('secp521r1');
//
// serverECDH.setPrivateKey(serverPrivateKeyECDH, 'base64');
//
//
// app.get('/request-public-ecdh-key', (req, res) => {
// 	res.send(serverPublicKeyECDH);
// }	);
// app.get('/rsa-public-key', (req, res) => {
// 	res.send(serverPublicRSAKey);
// } );
//
// // not relevant yet, might not be needed.
// app.post('/present-ecdh-key', async (req, res) => {
// 	const clientPublicKeyBase64 = req.body.clientPublicKeyBase64;
// 	const sharedSecret = serverECDH.computeSecret(clientPublicKeyBase64);
// 	//TODO maybe encrypt the shared secret with a symmetric key
// 	const personId = req.body.personId;
// //
// 	const query = 'INSERT INTO Agora.users.shared_secrets (person_id, shared_secret) VALUES (?, ?)';
// 	connection.query(query, [personId, sharedSecret], (err, results) => {
// 		if (err) {
// 			console.error(err);
// 			res.status(500).send('Error inserting data into database');
// 		} else {
// 			res.json({ message: 'Data inserted successfully', results });
// 		}
// 	});
// });