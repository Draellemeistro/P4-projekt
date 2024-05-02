const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require("crypto");
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createECDH } = require('node:crypto');
const blindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');
const serverRSACrypto = require('./utils/RSACryptoUtils.js');const app = express();
const serverECDHCrypto = require('./utils/ECDHCryptoUtils.js');

const pem2jwk = require('pem-jwk').pem2jwk; //to correctly format/encode and transport RSA key
const { JWK } = require('jose');	//to correctly format/encode and transport ECDH key



app.use(express.json());

// <
// const allowedOrigins = ['https://agora.servernux.com', 'http://130.225.39.205'];
//
// app.use(cors({
// 	origin: function(origin, callback){
// 		// allow requests with no originike mobile apps or curl requests)
// 		if(!origin) return callback(null, true);
// 		if(allowedOrigins.indexOf(origin) === -1){
// 			var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
// 			return callback(new Error(msg), false);
// 		}
// 		return callback(null, true);
// 	},
// 	credentials: true
// }));

app.use(cors({}));


let otpStore = {};

const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');



//const serverPublicKeyECDHPem = Buffer.from(fs.readFileSync(__dirname + '/serverPublicKeyECDH.pem',{encoding: 'utf-8'}), 'base64');	// TODO test if this works
//const serverPrivateKeyECDHPem = Buffer.from(fs.readFileSync(__dirname + '/serverPrivateKeyECDH.pem',{encoding: 'utf-8'}), 'base64'); // TODO test if this works
//const serverPublicKeyECDH = serverECDHCrypto.removePEM(serverPublicKeyECDHPem);
//const serverPrivateKeyECDH = serverECDHCrypto.removePEM(serverPrivateKeyECDHPem);
//serverECDHCrypto.initECDH().then(ECDHKeysStrings => {
//	console.log(ECDHKeysStrings);
//});
// .then(ECDHKeysStrings => {
//	fs.writeFileSync('serverPublicKeyECDH.json', ECDHKeysStrings.publicKeyString);
//	fs.writeFileSync('serverPrivateKeyECDH.json', ECDHKeysStrings.privateKeyString);
//});

////////////// for RSA asymmetric encryption  //////////////
//read the RSA keys from the files (works)
const pemFormatServerPublicRSAKey = fs.readFileSync(__dirname + '/serverPublicKeyRSA.pem', 'utf8');
const pemFormatServerPrivateRSAKey = fs.readFileSync(__dirname + '/serverPrivateKeyRSA.pem', 'utf8');
// Using NodeRSA to import the keys (should work, but need to check)
const serverRSAKeyPair = new NodeRSA();	//TODO maybe delete
serverRSAKeyPair.importKey(pemFormatServerPublicRSAKey, 'pkcs1-public-pem');
serverRSAKeyPair.importKey(pemFormatServerPrivateRSAKey, 'pkcs1-private-pem');
serverRSAKeyPair.extractable = true;
// this should work, but with sending and receiving? idk
serverRSACrypto.RSAUtilsTest(pemFormatServerPublicRSAKey, pemFormatServerPrivateRSAKey);

////////////// for ECDH key exchange //////////////
// read the ECDH keys from a single file (needs testing)
const keyPairECDHTest = Buffer.from(fs.readFileSync(__dirname + '/keyECDHTest.pem', 'utf8'));
// read the ECDH keys from the files (should work, but needs more testing)
const stringJWKServerPubKeyECDH = fs.readFileSync(__dirname + '/serverPublicKeyECDH.json', 'utf8');
const stringJWKServerPrivECDH = 	fs.readFileSync(__dirname + '/serverPrivateKeyECDH.json', 'utf8');

////////////// for RSA blind signing //////////////
// TODO: check which RSA key is used for blind signing

// Create a credentials object
app.use(express.json());
app.use(cors({
	origin: '192.168.0.113', // Update with your frontend URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}));
const credentials = {
	key: privateKey,
	cert: certificate,
	secureProtocol: 'TLSv1_2_method' // Use TLS 1.2
};

const serverLocal = https.createServer(credentials, app).listen(3030, () => console.log('HTTPs Server started'));


//Maybe replace with mysql.createPool
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'agora',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});
app.use(express.static(path.join(__dirname, '../Agora-app/build')));
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../Agora-app/build/index.html'));
	console.log('Static file server is running'); // Add this line
});

//app.listen(3030, () => console.log('HTTPs Server started'));
const serverLocalPort = serverLocal.address().port;
const serverLocalAddress = serverLocal.address().address;
console.log(`Server listening at https://${serverLocalAddress}:${serverLocalPort}`);
//console.log('RSA Public Key:', serverPublicRSAKey);
//console.log('RSA Public Key through import key:', serverRSAKeyPair.exportKey());



//TODO Still returning email maybe error codes
app.post('/get-email', async (req, res) => {
	const personId = req.body.personId;
	const voteId = req.body.voteId;
	console.log(voteId)

	connection.query('SELECT email FROM Agora.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
			console.log('Error 500')
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				console.log('Email:', email); // Add this line for logging
				const otp = generateOTP();
				console.log('OTP:', otp); // Add this line for logging
				const timestamp = Date.now(); // Get the current timestamp
				otpStore[personId] = { otp, timestamp }; // Store the OTP and timestamp
				console.log(otpStore[personId])
				console.log(`Stored OTP for personId: ${personId}`);
				// Create a Nodemailer transporter using SMTP
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: 'agoraAuth@gmail.com',
						pass: 'vnfpggwavqkwfrmu'
					}
				});

				// Define email options
				const mailOptions = {
					from: 'agoraAuth@gmail.com',
					to: email,
					subject: 'Your AGORA 2FA Code',
					text: `Your AGORA 2FA code is ${otp}`
				};

				// Send the email
				const info = await transporter.sendMail(mailOptions);

				res.json({ message: '2FA code sent' });

			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});




//TODO implement TOPT
function generateOTP() {
	return crypto.randomBytes(3).toString('hex');

}



app.post('/verify-2fa', async (req, res) => {
	const user2FACode = req.body.twoFactorCode;
	const personId = req.body.personId;
	const otpData = otpStore[personId];

	console.log(otpStore[personId])
	console.log(user2FACode)
	if (otpData) {
		const isOTPMatch = user2FACode === otpData.otp;
		const isOTPExpired = Date.now() > otpData.timestamp + 5 * 60 * 1000; // Check if more than 5 minutes have passed

		if (isOTPMatch && !isOTPExpired) {
			res.json({ message: 'User verified' });
			console.log('User verified');
		} else {
			res.json({ message: 'Invalid OTP' });
		}
	} else {
		res.json({ message: 'Invalid OTP' });
	}
});

app.post('/fetch-candidates', (req, res) => {
	connection.query('SELECT candidate, party FROM Agora.ballot', (err, results) => {
		if (err) throw err;
		else {
			console.log(results);
			res.json(results); // results is array of objects. each has candidate and party properties
		}
	});
} );


app.post('/request-public-ecdh-key', (req, res) => {
	console.log('Accessed /request-public-ecdh-key endpoint');
	const fixedJWKServerPubKeyECDH = JSON.stringify(serverECDHCrypto.fixAndValidateJWK(stringJWKServerPubKeyECDH));
	res.json({serverPubECDKey: stringJWKServerPubKeyECDH, fixedVersion: fixedJWKServerPubKeyECDH});
	console.log('ECDH Public Key sent');
}	);
app.post('/rsa-public-key', (req, res) => {
	console.log('Accessed /rsa-public-key endpoint');
	const jwkFormatServerPublicRSAKey = pem2jwk(pemFormatServerPublicRSAKey);
	res.json(jwkFormatServerPublicRSAKey);
	console.log('RSA Public Key sent');
} );
app.post('/temp-ecdh-key-from-client', (req, res) => {
	console.log('Accessed /temp-ecdh-key-from-client endpoint');
	const clientPubKey = req.body.clientPublicKey;
	let responseValue;
	if (clientPubKey.length === 0) {
		console.log('Client public key string is empty');
		responseValue = 0;
	}
	else {
		console.log('Client public key string is not empty');
		responseValue = 1;
	}
	console.log('Client public key string:', clientPubKey);
	res.json({ success: responseValue, returnKey: clientPubKey });
} );

// not relevant yet, might not be needed.


// TODO Database needs to have a table called encrypted_ballot_box with the following columns:
// 		enc_ballot (TEXT), enc_voter (TEXT), pubKeyECDH (TEXT) 		maybe more columns
app.post('/insert-ballot', (req, res) => {
	const enc_ballot = req.body.ballot;
	const enc_voter = req.body.voter;
	const pubKeyECDH = req.body.pubKeyECDH;
	const query = 'INSERT INTO Agora.ballotbox (ballotbox.encr_ballot, encr_voter_id, ECDH_pub_key) VALUES (?, ?, ?)';
	connection.query(query, [enc_ballot, enc_voter, pubKeyECDH], (err, results) => { //TODO this query needs extra security.
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});

app.post('/insert-ballot-and-return-hash', (req, res) => {
	const enc_ballot = req.body.ballot;
	const enc_voter = req.body.voter;
	const pubKeyECDH = req.body.pubKeyECDH;

	const ballotHash = crypto.createHash('sha256').update(JSON.stringify(enc_ballot)).digest('hex');
	//const ECDHSharedSecret = serverECDH.computeSecret(pubKeyECDH);
	// TODO decrypt the ballot with the shared secret and re-encrypt the hashed ballot for return
	const query = 'INSERT INTO Agora.ballotbox (ballotbox.encr_ballot, encr_voter_id, ECDH_pub_key) VALUES (?, ?, ?)';
	connection.query(query, [enc_ballot, enc_voter, pubKeyECDH], (err, results) => { //TODO this query needs extra security.
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json(JSON.stringify(ballotHash));
		}
});
});
app.post('/mark-ballot-as-faulty', (req, res) => {
	const enc_ballot = req.body.ballot;
	const enc_voter = req.body.voter;
	const pubKeyECDH = req.body.pubKeyECDH;
	const query = 'DELETE FROM Agora.ballotbox WHERE enc_ballot = ?';
	connection.query(query, [enc_ballot, enc_voter, pubKeyECDH], (err, results) => { //TODO this query needs extra security.
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});

app.post('/sign-blinded-msg', async (req, res) => {
	const blindedMessage = req.body.blindedMessage;
	const N = serverRSAKeyPair.keyPair.n.toString();
	const E = serverRSAKeyPair.keyPair.e.toString();
	const sign = blindSignature.sign({
		blinded: blindedMessage,
		key: serverRSAKeyPair.keyPair,
	});
	res.json(sign);
});

app.post('/verify-signed-blinded-msg', async (req, res) => {
	const signedBlindedMessage = req.body.signedBlindedMessage;
	const unblindedMessage = req.body.unblindedMessage;
	const N = serverRSAKeyPair.keyPair.n.toString();
	const E = serverRSAKeyPair.keyPair.e.toString();
	const verify = blindSignature.verify({
		unblinded: unblindedMessage,
		key: serverRSAKeyPair.keyPair,
		sig: signedBlindedMessage,
	});
	res.json(verify);
}); //TODO check if this is correct

app.post('/decrypt-RSA-message-Test', async (req, res) => {
	console.log('Accessed /decrypt-RSA-message-Test endpoint');
	const plainTextMessage = req.body.plainTextMessage;
	const encryptedMessage = req.body.encryptedMessage;
	const decryptedMessage = serverRSACrypto.decryptWithPrivRSA(encryptedMessage, pemFormatServerPrivateRSAKey);
	if (plainTextMessage === decryptedMessage) {
		console.log('RSA works!');
	} else {
		console.log('RSA does not work!');
	}
	res.json(decryptedMessage);
});
app.post('/present-ecdh-key', async (req, res) => {
	//TODO maybe delete. Shared secret can be computed from the client's public key
	const clientPublicKeyBase64 = req.body.clientPublicKeyBase64;
	const sharedSecret = serverECDH.computeSecret(clientPublicKeyBase64);
	//TODO maybe encrypt the shared secret with a symmetric key
	const personId = req.body.personId;
//
	const query = 'INSERT INTO Agora.users.shared_secrets (person_id, shared_secret) VALUES (?, ?)';
	connection.query(query, [personId, sharedSecret], (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});

app.post('/check-shared-secret', async (req, res) => {
	console.log('Accessed /check-shared-secret endpoint');
	let responseValue;
	let clientPublicKeyJWK = req.body.clientPublicKey;
	let clientSharedSecret = req.body.sharedSecret;
	let JWKserverPrivECDH = JSON.parse(stringJWKServerPrivECDH);
	let serverSharedSecret;

	// Parse the keys from JSON strings back into objects
	if(typeof clientPublicKeyJWK === 'string') {
		 clientPublicKeyJWK = JSON.parse(clientPublicKeyJWK);
	}
	if(typeof clientSharedSecret === 'string') {
		 clientSharedSecret = JSON.parse(clientSharedSecret);
	}
	clientPublicKeyJWK = serverECDHCrypto.fixAndValidateJWK(clientPublicKeyJWK);
	JWKserverPrivECDH = serverECDHCrypto.fixAndValidateJWK(JWKserverPrivECDH);
	console.log('Server private key D:', JWKserverPrivECDH.d);
	try {
		console.log('attempting to derive key: attempt 1');
		const serverSharedSecret = await crypto.subtle.deriveKey(
			{
				name: "ECDH",
				public: clientPublicKeyJWK,
			},
			JWKserverPrivECDH,
			{
				name: "AES-GCM",
				length: "256"
			},
			true,
			["encrypt", "decrypt"],
		);
	} catch (err) {
		console.error('propably need to import keys, printing error and attempting that', err);
		try {
			console.log('attempting to derive key: attempt 2');
			console.log('Server private key D:', JWKserverPrivECDH.d);
			const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', JWKserverPrivECDH, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
			const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
			serverSharedSecret = await crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: clientPublicKeyECDH,
				},
				serverPrivateKeyECDH,
				{
					name: "AES-GCM",
					length: 256
				},
				true,
				["encrypt", "decrypt"],
			);
		} catch (err) { console.error('Error:', err); }
		responseValue = false;
	}
	console.log('Server shared secret:', serverSharedSecret);
	const exportedServerSharedSecret = await crypto.subtle.exportKey('jwk', serverSharedSecret);
	const stringServerSharedSecret = JSON.stringify(exportedServerSharedSecret);
	if (clientSharedSecret === stringServerSharedSecret) {
		responseValue = true;
	} else {
		if (typeof stringServerSharedSecret === 'string' ) {
			console.log('Server shared secret:', stringServerSharedSecret);
			if (typeof clientSharedSecret === 'string') {
				console.log('Client shared secret:', clientSharedSecret);
			} else {
				console.log('Client shared secret is not a string');
			}
		} else {
				console.log('Server shared secret is not a string');
			}
		responseValue = false;
		}

	res.json({responseValue, stringServerSharedSecret});
});
app.post('/decrypt-ECDH-message-Test', async (req, res) => {
	console.log('Accessed /decrypt-ECDH-message-Test endpoint');
	const plainTextMessage = req.body.plainTextMessage;
	const encryptedMessage = req.body.encryptedMessage;
	const clientPublicKey = req.body.clientPublicKey;
	const decryptedMessage = 1;
})

async function makeECDHKeys() {
	return await serverECDHCrypto.initECDH();
}