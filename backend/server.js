const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require("crypto");
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors({
	origin: 'http://192.168.0.113:3000/', // Update with your frontend URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}));

/*
const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), 'utf8');

// Create a credentials object
const credentials = {
	key: privateKey,
	cert: certificate,
	secureProtocol: 'TLSv1_2_method' // Use TLS 1.2
};
// Create an HTTPS service with the Express app
const httpsServer = https.createServer(credentials, app);
*/

//Maybe replace with mysql.createPool
const connection = mysql.createConnection({
	host: '130.225.39.205:3000',
	user: 'user',
	password: 'password',
	database: 'Agora'

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

app.listen(3000, () => console.log('HTTP Server started'));


//TODO Still returning email maybe error codes
app.post('/get-email', async (req, res) => {
	const personId = req.body.personId;
	const voteId = req.body.voteId;
	console.log('this ran')

	connection.query('SELECT email FROM users.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
			console.log('Error 500')
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				console.log('Email:', email); // Add this line for logging
				getSecretKey(email, async (err, secretKey) => {
					if (err) {
						res.status(501).send('Error fetching secret key');
						console.log('Error 501')

					} else {
						console.log('Secret key:', secretKey); // Add this line for logging
						if (secretKey) {
							const otp = generateOTP(secretKey);
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
							res.status(500).send('Secret key not found');
						}
					}
				});
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});


function getSecretKey(email, callback) {
	connection.query('SELECT secret_key FROM users WHERE email = ?', [email], (err, results) => {
		if (err) {
			callback(err);
		} else {
			if (results && results.length > 0 && results[0].secret_key) {
				callback(null, results[0].secret_key);
			} else {
				callback(new Error('Secret key not found'));
			}
		}
	});
}


//TODO implement TOPT
function generateOTP(secretKey) {
	const hmac = crypto.createHmac('sha256', secretKey);
	const otp = hmac.digest('hex').substring(0, 6);
	return otp;
}


app.post('/insert-ballot', (req, res) => {
	const ballot= req.body.ballot;
	const rsaKey = req.body.rsaKey;
	const query = 'INSERT INTO users.encrypted_ballot_box (rsa_key, ballot) VALUES (?, ?)';

	connection.query(query, [rsaKey, ballot], (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});

function compare2FACodes(user2FACode, twoFactorCodeFromDatabase, res) {
	if (user2FACode === twoFactorCodeFromDatabase) {
		res.send('User verified');
	} else {
		res.send('Invalid 2FA code');
	}
}
app.post('/verify-2fa', async (req, res) => {
	const user2FACode = req.body.twoFACode;
	const personId = req.body.personId;
	const voteId = req.body.voteId;
	// TODO: Retrieve the 2FA code from your database associated with the user
	console.log('this ran: verify start')
	connection.query('SELECT secret_key FROM users.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching 2FA code from database');
			console.log('Error 500')
		} else {
			if (results.length > 0) {
				const twoFactorCodeFromDatabase = results[0].secret_key;
				console.log('2FA code:', twoFactorCodeFromDatabase); // Add this line for logging
				if (twoFactorCodeFromDatabase) {
					compare2FACodes(user2FACode, twoFactorCodeFromDatabase, res);
				} else {
					res.status(500).send('2FA code not found');
				}
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});