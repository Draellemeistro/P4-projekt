const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const connection = require('../utils/db.js');
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');
const crypto = require('crypto');
const { exportPublicKeys } = require('../utils/cryptoFunctions/utilsCrypto');

const router = express.Router();


router.post('/', async (req, res) => {
	const { hashedDetail } = req.body;
	console.log(req.body);
	const { personIdHash, voteIdHash, salt } = hashedDetail;


	connection.query('SELECT email, vote_id FROM Agora.users WHERE person_id = ?', [personIdHash], async (err, results) => {
	const { personId, voteId } = req.body; //TODO: hvad sker der her?

		if (err) {
			res.status(500).send('Error fetching email from database');
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				const voteIdFromDB = results[0].vote_id;
				//const hashVoteIdFromDB = crypto.createHash('sha256').update(voteIdFromDB + salt).digest('hex');
				const encoder = new TextEncoder();
				const dataVoteId = encoder.encode(voteIdFromDB + salt);
				const hashVoteIdFromDB = crypto.createHash('sha256').update(dataVoteId).digest('hex');
				if (hashVoteIdFromDB !== voteIdHash) {
					console.log('hashVoteIdFromDB:', hashVoteIdFromDB)
					console.log('voteIdHash:', voteIdHash)
					res.status(400).send('Invalid voteId');
					return;
				}
				const otp = generateOTP();
				const timestamp = Date.now();
				OTPStore.addOTP(personIdHash, { otp, timestamp });
				try {
					await sendEmail(email, otp);
					console.log(otp)
					const keyRing = exportPublicKeys();
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