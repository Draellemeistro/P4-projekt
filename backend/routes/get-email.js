const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const connection = require('../utils/db.js');
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');
const { keyStore } = require('../utils/keyStore.js');
const { exportPublicKeys } = require('../utils/cryptoFunctions/utilsCrypto');

const router = express.Router();


router.post('/', async (req, res) => {
	const { personId, voteId, clientPublicKey } = req.body;
	keyStore[personId] = clientPublicKey;
	const keyRing = exportPublicKeys();
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
					console.log(otp)

					res.json({ message: 'Email sent successfully', keys: keyRing});
				} catch (error) {
					console.error('Error sending email: ', error);
					res.status(500).send('Error sending email');
				}
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

module.exports = router;