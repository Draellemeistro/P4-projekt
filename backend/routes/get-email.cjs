const express = require('express');
const { generateOTP } = require('../utils/generateOTP.js');
const connection = require('../utils/db.js');
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');

const router = express.Router();

router.post('/', async (req, res) => {
	const { personId, voteId } = req.body;

	connection.query('SELECT email FROM Agora.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], async (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				const otp = generateOTP();
				const timestamp = Date.now();
				OTPStore.addOTP(personId, { otp, timestamp });

				try {
					await sendEmail(email, otp);
					res.json({ publicKey });
				} catch (error) {
					res.status(500).send('Error sending email');
				}
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

export default router;