// routes/get-email.js
import express from 'express';
import nodemailer from 'nodemailer';
import { generateOTP } from '../utils/generateOTP.js';
import connection from '../utils/db.js';
import { otpStore } from '../utils/otpStore.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // for some reason this is needed to get the current directory

const publicKey = fs.readFileSync(path.join(__dirname, '/utils/keys/serverPublicKeyECDH.pem', 'utf8'));



router.post('/', (req, res) => {
	const { personId, voteId } = req.body;

	connection.query('SELECT email FROM Agora.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
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

				res.json({ publicKey });
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

export default router;