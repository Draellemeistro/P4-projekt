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
const { JWK } = require('jose');
const serverSignCrypto = require('./utils/signCrypto');	//to correctly format/encode and transport ECDH key



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
	database: 'Agora',
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
			console.log(typeof results)
			res.json(results); // results is array of objects. each has candidate and party properties
		}
	});
} );


app.post('/request-public-ecdh-key', (req, res) => {
	console.log('Accessed /request-public-ecdh-key endpoint');
	res.json({serverPubECDKey: stringJWKServerPubKeyECDH});
	console.log('ECDH Public Key sent');
}	);
app.post('/rsa-public-key', (req, res) => {
	console.log('Accessed /rsa-public-key endpoint');
	const jwkFormatServerPublicRSAKey = pem2jwk(pemFormatServerPublicRSAKey);
	res.json(jwkFormatServerPublicRSAKey);
	console.log('RSA Public Key sent');
} );
app.post('/client-key-post-test', (req, res) => {
	console.log('Accessed /temp-ecdh-key-from-client endpoint');
	const clientPubKey = req.body.clientPublicKey;
	let responseValue;
	if (clientPubKey.length === 0) {
		console.log('Client public key string is empty');
		responseValue = 0;
	}	else {
		responseValue = 1;
	}
	res.json({ success: responseValue, returnKey: clientPubKey });
} );

// not relevant yet, might not be needed.


// TODO Database needs to have a table called encrypted_ballot_box with the following columns:
// 		enc_ballot (TEXT), pubKeyECDH (TEXT), ivValue (????) 		maybe more columns
app.post('/insert-ballot', async (req, res) => {
	let data;
	if (typeof req.body === 'string') {
		data = JSON.parse(req.body);
	} else {
		data = req.body;
	}
	const { ballot, clientPubKeyECDH, ivValue } = data;
	let OuterBallot;
	let innerBallot;
	let sharedSecret
	if (ivValue !== null && clientPubKeyECDH !== null) {
		sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKeyECDH);
		console.log('Shared secret:', sharedSecret);
		OuterBallot = await serverECDHCrypto.handleEncryptedMessage(OuterBallot, ivValue, sharedSecret);
		console.log('received ECDH encrypted ballot');
	} else {
		console.log('received RSA encrypted ballot');
		OuterBallot = serverRSACrypto.decryptWithPrivRSA(ballot, pemFormatServerPrivateRSAKey);
	}
	/// TODO: fix and try this out

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

app.post('/insert-ballot-double-enc', async (req, res) => {
	console.log('Accessed /insert-ballot-double-enc endpoint');
	const encBallot = req.body.encryptedSubLayer;
	const clientKeyPub = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientKeyPub);
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encBallot, ivValue, sharedSecret);
	//TODO: do some handling of decrypted layers data.
	if (typeof decryptedMessage === 'string') {
		decryptedMessage = JSON.parse(decryptedMessage);
	}
	try {
		console.log('Original message:', encBallot);
		console.log('Decrypted message:', decryptedMessage);
		//Object.keys(decryptedMessage).forEach(key => {
		//});
	} catch (error) {
		console.error('Error:', error);
	}

	/// TODO: do we want this? ballot should be storable even before first round of decryption. Could save them for later use?
	//let ivArray = Object.values(ivValue);
	//let ivHexString = ivArray.map(byte => byte.toString(16).padStart(2, '0')).join(''); // Convert the IV to a hex string, for storage in the database
	//
	// const query = 'INSERT INTO Agora.ballotbox (ballotbox.encr_ballot, ecdh_pub_key, iv_value) VALUES (?, ?, ?)';
	// connection.query(query, [encBallotString, clientKeyPubString, ivValueString], (err, results) => {
	// 	if (err) {
	// 		console.error(err);
	// 		res.status(500).send('Error inserting data into database');
	// 	} else {
	// 		res.json({ message: 'Data inserted successfully', results });
	// 	}
	//	});
	//
	//let ivArrayDB = {}; //[]??????
	//for (let i = 0; i < ivHexString.length; i += 2) {
	//	ivArrayDB.push(parseInt(ivHexString.substring(i, i + 2), 16)); // Convert the hex string back to an array of bytes.
	//}
});

app.post('/decrypt-RSA-plus-sign', async (req, res) => {
	console.log('Accessed /decrypt-RSA-message-Test endpoint');
	const plainTextMessage = req.body.plainTextMessage;
	const encryptedMessage = req.body.encryptedMessage;
	const signature = req.body.signature;
	const key = req.body.key;
	const verified = await serverSignCrypto.verifyReceivedMessage(signature, encryptedMessage, key);
	if (verified) {
		console.log('Signature verified. RSA decryption may now begin.');
		const decryptedMessage = serverRSACrypto.decryptWithPrivRSA(encryptedMessage, pemFormatServerPrivateRSAKey);
		if (plainTextMessage === decryptedMessage) {
			console.log('RSA works!');
		} else {
			console.log('RSA does not work!');
		}
		res.json(verified);
	}

});

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

app.post('/check-shared-secret-test', async (req, res) => {
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
	const jwkServer = {
		ext: true,
		kty: JWKserverPrivECDH.kty,
		d: JWKserverPrivECDH.d,
		crv:JWKserverPrivECDH.crv,
		x: JWKserverPrivECDH.x,
		y: JWKserverPrivECDH.y
	};
	clientPublicKeyJWK.key_ops = ['deriveBits'];
	console.log('Client public key:', clientPublicKeyJWK);
	const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', jwkServer, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
	const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, []);
	try {
		console.log('attempting to derive key: 1');

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
	} catch (error) {
		console.log('Trying again with no key_ops: 2');
		try {
			const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', JWKserverPrivECDH, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
			const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
			serverSharedSecret = await window.crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: clientPublicKeyECDH,
				},
				serverPrivateKeyECDH,
				{
					name: "AES-GCM",
					length: "256"
				},
				true,
				[],
			);
		} catch (error) {
			console.error('2: third attempt failed:', error);
		}
		console.error('1: second attempt failed:', error);
	}

	console.log('Server shared secret:', serverSharedSecret);
	const exportedServerSharedSecret = await crypto.subtle.exportKey('jwk', serverSharedSecret);
	const stringServerSharedSecret = JSON.stringify(exportedServerSharedSecret);
	let clientSharedSecretString;
	// COMPARISON: exportedServerSharedSecret vs clientSharedSecret
	let aesKeyServer = {
		key_ops: exportedServerSharedSecret.key_ops,
		ext: exportedServerSharedSecret.ext,
		kty: exportedServerSharedSecret.kty,
		k: exportedServerSharedSecret.k,
		alg: exportedServerSharedSecret.alg,
	}
	let aesKeyClient = {
		key_ops: clientSharedSecret.key_ops,
		ext: clientSharedSecret.ext,
		kty: clientSharedSecret.kty,
		k: clientSharedSecret.k,
		alg: clientSharedSecret.alg,
	}
	if(aesKeyServer.k === aesKeyClient.k) {
		console.log('Shared secret is identical to eachother\nEYOOOOOO!!');
		responseValue = true;
	} else {
		if (typeof clientSharedSecret !== 'string') {
			console.log('Client shared secret is getting converted to a string');
			clientSharedSecretString = JSON.stringify(clientSharedSecret);
			if (clientSharedSecret === stringServerSharedSecret) {
				console.log('Shared secret is identical to eachother\nEYOOOOOO!!');
				responseValue = true;
			} else {
				console.log('Server shared secret:', stringServerSharedSecret);
				console.log('Client shared secret:', clientSharedSecret);
				responseValue = false;
			}
		}
	}
	res.json({success: responseValue});
});
app.post('/decrypt-ECDH-message-Test', async (req, res) => {
	console.log('Accessed /decrypt-ECDH-message-Test endpoint');
	const plainTextMessage = req.body.plainTextMessage;
	const encryptedMessage = req.body.encryptedMessage;
	const clientPublicKey = req.body.clientPublicKey;
	const IvValueFromClient = req.body.IvValue;
					//IvValue type: object
		//clientKeyPub type: string
			//encryptedMessage type: string
			//plainTextMessage type: string
	let responseValue;
	let decryptedMessage;
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPublicKey);
	console.log('Shared secret:', sharedSecret);
	decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, IvValueFromClient, sharedSecret);
	if (plainTextMessage === decryptedMessage) {
		console.log('ECDH works!');
		responseValue = true;
	} else {
		console.log('ECDH didnt work: ','\nexpected: ', plainTextMessage,'\nreceived: ', decryptedMessage);
		responseValue = false;
	}
	res.json({success: responseValue, encryptedMessage: encryptedMessage, decryptedMessage: decryptedMessage, IvValueFromClient: IvValueFromClient, serverSharedSecret: sharedSecret});
});

app.post('/combined-encryption-test', async (req, res) => {
	console.log('Accessed /combined-encryption-test endpoint');
	const plainTextMessage = req.body.message;
	const encryptedMessage = req.body.encrypted;
	let clientPubKey = req.body.clientPubKey;
	let ivValue = req.body.ivValue;
	let rsaFirst = false;
	let response;
	let decryptedMessageOuterRSA;
	let decryptedMessageOuterECDH
	let outerReturn;
	if (clientPubKey === null) {
		rsaFirst = true;
		decryptedMessageOuterRSA = serverRSACrypto.decryptWithPrivRSA(encryptedMessage, pemFormatServerPrivateRSAKey);
		if (typeof decryptedMessageOuterRSA === 'string') {
			console.log(' inner message is a string RSA to ECDH: ', decryptedMessageOuterRSA);
			clientPubKey = JSON.parse(decryptedMessageOuterRSA).clientPubKey;
			ivValue = JSON.parse(decryptedMessageOuterRSA).ivValue;
			decryptedMessageOuterRSA = JSON.parse(decryptedMessageOuterRSA).encryptedMessage;
		} else {
			clientPubKey = decryptedMessageOuterRSA.clientPubKey;
			ivValue = decryptedMessageOuterRSA.ivValue;
			decryptedMessageOuterRSA = decryptedMessageOuterRSA.encryptedMessage;
		}
	}
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
	if (rsaFirst === false) {
		decryptedMessageOuterECDH = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, sharedSecret, ivValue);
		if (typeof decryptedMessageOuterECDH === 'string') {
			console.log(' inner message is a string ECDH to RSA: ', decryptedMessageOuterECDH);
			decryptedMessageOuterECDH = JSON.parse(decryptedMessageOuterECDH).encryptedMessage;
			response = serverRSACrypto.decryptWithPrivRSA(decryptedMessageOuterECDH, pemFormatServerPrivateRSAKey);
			outerReturn = decryptedMessageOuterECDH;
		} else {
			response = serverRSACrypto.decryptWithPrivRSA(decryptedMessageOuterECDH.encryptedMessage, pemFormatServerPrivateRSAKey);
			outerReturn = decryptedMessageOuterECDH;
		}
	} else {
		response = await serverECDHCrypto.handleEncryptedMessage(decryptedMessageOuterRSA, sharedSecret, ivValue);
		outerReturn = decryptedMessageOuterRSA;
	}
	console.log('Response:', response);
	console.log('plainTextMessage:', plainTextMessage);
	res.json({response: response, outer: outerReturn});
});

app.post(/rsa-to-ecdh-test/, async (req, res) => {
	console.log('Accessed /rsa-to-ecdh-test endpoint');
	const plainTextMessage = req.body.plaintext;
	const midwayMessage = req.body.midWayEncrypted; /////wtf, why is this the one that is signed???
	const encryptedMessage = req.body.OutgoingEncrypted;
	const clientPubKey = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;
	const signatureBase64 = req.body.signature;
	const signatureKey = req.body.signatureKey;
	for (let key in req.body) {

		if (req.body.hasOwnProperty(key)) {
			console.log(`Key: ${key}, Value: ${req.body[key]}, Type: ${typeof req.body[key]} `);
		}
	}

	serverSignCrypto.importKey(JSON.stringify(signatureKey)).then(r => {
		serverSignCrypto.clientKey = r;
		serverSignCrypto.verify(signatureBase64, midwayMessage, serverSignCrypto.clientKey).then(r => {
			console.log('Signature verified in then then....:', r);
			if (r){
				console.log('Signature verified. 2x2x decryption may now begin.');
				let sharedSecret = serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
				let decryptedMessage = serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, sharedSecret);
				if (decryptedMessage === midwayMessage) {
					console.log('ECDH upper layer works!');
				}
				let decryptedMidWayMsg = serverRSACrypto.decryptWithPrivRSA(decryptedMessage, pemFormatServerPrivateRSAKey);
				if (decryptedMidWayMsg === plainTextMessage) {
					console.log('RSA to ECDH works!');
				}
			}
		});
	});
	const verified = await serverSignCrypto.verifyReceivedMessage(signatureBase64, encryptedMessage, signatureKey);
	if (verified) {
		console.log('Signature verified. 2x2x decryption may now begin.');
		let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
		let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, sharedSecret);
		if (decryptedMessage === midwayMessage) {
			console.log('ECDH upper layer works!');
		}
		let decryptedMidWayMsg = serverRSACrypto.decryptWithPrivRSA(decryptedMessage, pemFormatServerPrivateRSAKey);
		if (decryptedMidWayMsg === plainTextMessage) {
			console.log('RSA to ECDH works!');
		}
		res.json(decryptedMessage);
	}
	else {
		console.log('Signature verification failed');
		console.log('Signature verification failed');
		console.log('Signature verification failed');
		console.log('Signature verification failed');
		console.log('Signature verification failed');

		if (signatureKey === null) {
			console.log('Signature key is null');
		}
		if (typeof signatureKey === 'string') {
			console.log('Signature key is a string');
		} else {
			console.log('Signature key is not a string');
			console.log('Signature key:', signatureKey);
			serverSignCrypto.verifyReceivedMessage(signatureBase64, encryptedMessage, JSON.stringify(signatureKey)).then(async r => {
				console.log('Result:', r);
				if (r) {
					console.log('Signature verified. 2x2x decryption may now begin.');
					let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
					let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, sharedSecret);
					if (decryptedMessage === midwayMessage) {
						console.log('ECDH upper layer works!');
						console.log('ECDH upper layer works!');
						console.log('ECDH upper layer works!');
						console.log('ECDH upper layer works!');
						console.log('ECDH upper layer works!');
					}
					let decryptedMidWayMsg = serverRSACrypto.decryptWithPrivRSA(decryptedMessage, pemFormatServerPrivateRSAKey);
					if (decryptedMidWayMsg === plainTextMessage) {
						console.log('RSA to ECDH works!');
						console.log('RSA to ECDH works!');
						console.log('RSA to ECDH works!');
						console.log('RSA to ECDH works!');
						console.log('RSA to ECDH works!');
					}

				}
			});
		}
	}

});

app.post('/ecdh-to-rsa-test', async (req, res) => {
	console.log('Accessed /ecdh-to-rsa-test endpoint');
	const plainTextMessage = req.body.plaintext;
	const midwayMessage = req.body.midWayEncrypted;
	const encryptedMessage = req.body.OutgoingEncrypted;
	const clientPubKey = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;
	const decryptedMessage = serverRSACrypto.decryptWithPrivRSA(encryptedMessage, pemFormatServerPrivateRSAKey);
	if (decryptedMessage.encryptedMessage === midwayMessage) {
		console.log('2RSA upper layer works!');
	}
	console.log('decrypted Type:',typeof decryptedMessage);
	console.log('decrypted:', decryptedMessage);
	console.log('midwayMessage:', midwayMessage);
	let nextStep = JSON.parse(decryptedMessage);
	if (nextStep.encryptedMessage === midwayMessage) {
		console.log('RSA upper layer works!');
	}

	Object.keys(nextStep).forEach(key => {
		console.log(key, nextStep[key], typeof nextStep[key]);
	});
	let values = Object.values(nextStep);
	console.log(values); // Output: ['John', 30, 'New York'
let toDecrypt = nextStep.encryptedMessage;
console.log('newIv type:', typeof nextStep.ivValue, nextStep.ivValue);
	if (nextStep.ivValue !== undefined && nextStep.ivValue !== null) { // TODO see how ivValue is sent, and how it is received
		let entries = Object.entries(nextStep.ivValue);
		console.log(entries);
	} else {
		console.error('newIv is undefined or null:', nextStep.ivValue);
	}
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, nextStep.clientKeyPub);
	let fullyDecryptedMessage = await serverECDHCrypto.handleEncryptedMessage(toDecrypt, nextStep.ivValue, sharedSecret);
	if (fullyDecryptedMessage === plainTextMessage) {
		console.log('ECDH to RSA works!');
	}
});
app.post('/sig-public-key', async (req, res) => {
	let clientKey = req.body.clientKeyExport;
	console.log('clientKey:', clientKey)
	const v = await serverSignCrypto.genKeys();
	let returnKey = await serverSignCrypto.exportKey();

	await serverSignCrypto.importKey(clientKey);
	res.json(JSON.stringify({returnKey: returnKey}));
});

app.post('/verify-sig', async (req, res) => {
	const signature = req.body.signature;
	const message = req.body.message;
	const sigArrBuffer = serverSignCrypto.base64ToArrayBuffer(signature);
	const verify = await serverSignCrypto.verify(sigArrBuffer, message, serverSignCrypto.clientKey);
	if (verify === true) {
		console.log('Signature is valid');
	} else {
		console.log('Signature is invalid');
		console.log('Signature:', signature);
	}
	res.json(verify);
});
app.post('/sign-message', async (req, res) => {
	const message = "Hello, world!";
	const signature = await serverSignCrypto.sign(message);
	const signatureBase64 = serverSignCrypto.arrayBufferToBase64(signature);
	console.log(JSON.stringify({signature: signatureBase64, message: message}))
	res.json({signature: signatureBase64, message: message});
});

app.post('/verify-2x-encrypted-msg', async (req, res) => {
	console.log('Accessed /verify-2x-encrypted-msg endpoint');
	const plainTextMessage = req.body.plaintext;
	const midwayMessage = req.body.midWayEncrypted;
	const encryptedMessage = req.body.message;
	const clientPubKey = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;
	const signature = req.body.signature;
	const signatureKey = req.body.signatureKey;


	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, sharedSecret);
	if (decryptedMessage === midwayMessage) {
		console.log('ECDH upper layer works!');
	}
	let decryptedMidWayMsg = serverRSACrypto.decryptWithPrivRSA(decryptedMessage, pemFormatServerPrivateRSAKey);
	if (decryptedMidWayMsg === plainTextMessage) {
		console.log('RSA to ECDH works!');
	}
	res.json(decryptedMessage);
});