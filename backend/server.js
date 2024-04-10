const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(cors({
	origin: 'http://localhost:5173', // Update with your frontend URL
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}));


//Maybe replace with mysql.createPool
const connection = mysql.createConnection({
	host: '20.79.40.89',
	user: 'user',
	password: 'password',
	database: 'users'
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to MySQL');
});

app.listen(3000, () => console.log('Server started'));


app.post('/get-email', async (req, res) => {
	const personId = req.body.personId;
	const voteId = req.body.voteId;
	console.log('this ran')

	connection.query('SELECT email FROM users WHERE person_id = ? AND vote_id = ?', [personId, voteId], (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				res.send(email);
			} else {
				res.status(404).send('User not found');
			}
		}
	});
});


function getSecretKey(email, callback) {
	connection.query('SELECT secret_key FROM users WHERE email = ?', [email], (err, results) => {
		if (err) {
			callback(err);
		} else {
			callback(null, results[0].secret_key);
		}
	});
}

//TODO implement TOPT
function generateOTP(secretKey) {
	const hmac = crypto.createHmac('sha256', secretKey);
	const otp = hmac.digest('hex').substring(0, 6);
	return otp;
}

app.post('/send-2fa', async (req, res) => {
	const userEmail = req.body.email;
	getSecretKey(userEmail, async (err, secretKey) => {
		if (err) {
			res.status(500).send('Error fetching secret key');
		} else {
			const otp = generateOTP(secretKey);
			// Create a Nodemailer transporter using SMTP
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'agoraAuth@gmail.com',
					pass: '1agoraAuthentication!'
				}
			});

			// Define email options
			const mailOptions = {
				from: 'agoraAuth@gmail.com',
				to: userEmail,
				subject: 'Your AGORA 2FA Code',
				text: `Your AGORA 2FA code is ${otp}`
			};

			// Send the email
			const info = await transporter.sendMail(mailOptions);

			res.send('2FA code sent');
		}
	});
});

app.post('/verify-2fa', async (req, res) => {
	const userEmail = req.body.email;
	const user2FACode = req.body.twoFactorCode;

	// TODO: Retrieve the 2FA code from your database associated with the user

	// Compare the 2FA code entered by the user with the one in your database
	if (user2FACode === twoFactorCodeFromDatabase) {
		res.send('User verified');
	} else {
		res.send('Invalid 2FA code');
	}
});


