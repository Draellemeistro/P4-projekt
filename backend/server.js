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


const app = express();

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


///app.listen(80, () => console.log('HTTP Server started'));

const serverPublicKeyECDH = fs.readFileSync(__dirname + '/serverPublicKeyECDH.pem', 'utf8');
const serverPrivateKeyECDH = fs.readFileSync(__dirname + '/serverPrivateKeyECDH.pem', 'utf8');
const serverPublicRSAKey = fs.readFileSync(__dirname + '/serverPublicKeyRSA.pem', 'utf8');
const serverPrivateRSAKey = fs.readFileSync(__dirname + '/serverPrivateKeyRSA.pem', 'utf8');
const serverECDH = createECDH('secp521r1');
const serverRSAKeyPair = new NodeRSA();
serverRSAKeyPair.importKey(serverPublicRSAKey, 'pkcs1-public-pem');
serverRSAKeyPair.importKey(serverPrivateRSAKey, 'pkcs1-private-pem');


// Create a credentials object
app.use(express.json());
app.use(cors({
	origin: '*', // Update with your frontend URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}));
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

const serverLocal = https.createServer(credentials, app).listen(3030, () => console.log('HTTPs Server started'));
//app.listen(3030, () => console.log('HTTPs Server started'));
const serverLocalPort = serverLocal.address().port;
const serverLocalAddress = serverLocal.address().address;
console.log(`Server listening at https://${serverLocalAddress}:${serverLocalPort}`);

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

//
//app.use(express.static(path.join(__dirname, '../Agora-app/build')));
//app.get('*', (req, res) => {
//	res.sendFile(path.join(__dirname, '../Agora-app/build/index.html'));
//	console.log('Static file server is running'); // Add this line
//});

//https.createServer(credentials, app).listen(443);
//app.listen(3000, () => console.log('HTTP Server started'));


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


app.get('/request-public-ecdh-key', (req, res) => {
	res.json(serverPublicKeyECDH);
}	);
app.get('/rsa-public-key', (req, res) => {

	res.json.stringify(serverPublicRSAKey);
} );

// not relevant yet, might not be needed.
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
	const clientSharedSecret = req.body.clientSharedSecret;
	const publicKey = req.body.clientPublicKeyBase64;
	const sharedSecret = serverECDH.computeSecret(clientPublicKeyBase64);
	if (clientSharedSecret === sharedSecret) {
		res.json({ message: 'Shared secret matches' });
	} else {
		res.json({ message: 'Shared secret does not match' });
	}
});

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
const encryptedMessage = req.body.encryptedMessage;
	const decryptedMessage = serverRSAKeyPair.decrypt(encryptedMessage, 'utf8');
	res.json(decryptedMessage);
});