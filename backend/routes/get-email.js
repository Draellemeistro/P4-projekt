const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const db = require('../utils/db.js'); // Import db instead of connection
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');
const { keyStore } = require('../utils/keyStore.js');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverRSA = require('../utils/cryptoFunctions/serverRSA');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const crypto = require('crypto');
const { exportPublicKeys } = require('../utils/keyUsage.js');
const { hashString } = require('../utils/cryptoFunctions/serverCryptoUtils');

const router = express.Router();

router.post('/', async (req, res) => {
	const { hashedDetail} = req.body;
	const keyRing = await exportPublicKeys();
	console.log(req.body);
	const { personIdHash, voteIdHash, salt } = hashedDetail;
	console.log(personIdHash)
	const results = await db.getUserByEmail(personIdHash); // Use the new function
	if (results.length > 0) {
		const email = results[0].email;
		const voteIdFromDB = results[0].vote_id;
		const ID = results[0].ID;
		const hashVoteIdFromDB = await hashString({ voteId: voteIdFromDB, salt: salt })
		if (hashVoteIdFromDB !== voteIdHash) {
			res.status(400).send('Invalid voteId');
		}
		const otp = generateOTP();
		const timestamp = Date.now();
		OTPStore.addOTP(personIdHash, { otp, timestamp });
		try {
			await sendEmail(email, otp);
			console.log(otp)
			res.json({ message: 'Email sent successfully', keys: keyRing, ID});
		} catch (error) {
			console.error('Error sending email: ', error);
			res.status(500).send('Error sending email');
		}
	} else {
		res.status(404).send('No user found with the provided personId and voteId');
	}
});

module.exports = router;