const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/send-2fa', async (req, res) => {
	const userEmail = req.body.email;
	const twoFactorCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code for OTP

	// TODO: Store the 2FA code in your database associated with the user

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
		text: `Your AGORA 2FA code is ${twoFactorCode}`
	};

	// Send the email
	const info = await transporter.sendMail(mailOptions);

	res.send('2FA code sent');
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

app.listen(3000, () => console.log('Server started'));
