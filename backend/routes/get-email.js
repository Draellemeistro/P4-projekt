const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const connection = require('../utils/db.js');
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');
const { keyStore } = require('../utils/keyStore.js');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverRSA = require('../utils/cryptoFunctions/serverRSA');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const crypto = require('crypto');
const { exportPublicKeys } = require('../utils/keyUsage.js');

const router = express.Router();


router.post('/', async (req, res) => {
	const { hashedDetail, clientPublicKey } = req.body;
	console.log(req.body);
	const { personIdHash, voteIdHash, salt } = hashedDetail;
	keyStore[personIdHash] = clientPublicKey;
	//const keyRing = await exportPublicKeys();
	const keyRing = {RSA: '111', ECDH: '222', DigSig: '333'};
	console.log(personIdHash)
	connection.query('SELECT email, vote_id FROM Agora.users WHERE person_id = ?', [personIdHash], async (err, results) => {
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
				console.log('hashVoteIdFromDB:', hashVoteIdFromDB)
				console.log('voteIdHash:', voteIdHash)
				if (hashVoteIdFromDB !== voteIdHash) {
					res.status(400).send('Invalid voteId');
				}
				const otp = generateOTP();
				const timestamp = Date.now();
				OTPStore.addOTP(personIdHash, { otp, timestamp });
				try {
					await sendEmail(email, otp);
					console.log(otp)



					return res.json({ message: 'Email sent successfully', keys: keyRing});
				} catch (error) {
					console.error('Error sending email: ', error);
					return res.status(500).send('Error sending email');
				}
			} else {
				return res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

module.exports = router;