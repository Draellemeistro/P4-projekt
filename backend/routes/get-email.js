const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const db = require('../utils/db.js');
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

async function fetchUserDetails(personIdHash) {
	return await db.getUserByEmail(personIdHash);
}

async function generateAndStoreOTP(personIdHash) {
	const otp = generateOTP();
	const timestamp = Date.now();
	OTPStore.addOTP(personIdHash, { otp, timestamp });
	return otp;
}

async function sendOTP(email, otp) {
	return await sendEmail(email, otp);
}

router.post('/', async (req, res) => {
	const { hashedDetail } = req.body;
	const keyRing = await exportPublicKeys();
	const { personIdHash, voteIdHash, salt } = hashedDetail;
	const results = await fetchUserDetails(personIdHash);
	if (results.length > 0) {
		const email = results[0].email;
		const voteIdFromDB = results[0].vote_id;
		const ID = results[0].ID;
		const hashVoteIdFromDB = await hashString({ voteId: voteIdFromDB, salt: salt })
		if (hashVoteIdFromDB !== voteIdHash) {
			return res.status(400).send('Invalid voteId');
		}

		const otp = await generateAndStoreOTP(personIdHash);
		try {
			await sendOTP(email, otp);
			res.json({ message: 'Email sent successfully', keys: keyRing, ID });
		} catch (error) {
			res.status(500).send('Error sending email');
		}
	} else {
		res.status(404).send('No user found with the provided personId and voteId');
	}
});

module.exports = router;