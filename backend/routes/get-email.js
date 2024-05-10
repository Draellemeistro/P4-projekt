const express = require('express');
const { generateOTP } = require('../utils/generateOTP');
const connection = require('../utils/db.js');
const OTPStore = require('../utils/otpStore.js');
const { sendEmail } = require('../utils/sendEmail.js');
const fs = require('fs');
const path = require('path');
const pemJwk = require('pem-jwk');



const router = express.Router();
const PublicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'), 'utf8');
const PublicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.pem'), 'utf8');

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
					const PublicRSAKey_JWK = pemJwk.pem2jwk(PublicRSAKey);
					console.log('This runs')
					try {
						const PublicECDHKey_JWK = pemJwk.pem2jwk(PublicECDHKey);
						console.log('PublicECDHKey_JWK: ', PublicECDHKey_JWK);
					} catch (error) {
						console.error('Error converting ECDH key to JWK: ', error);
					}
					console.log('PublicRSAKey_JWK: ', PublicRSAKey_JWK, 'PublicECDHKey_JWK: ', PublicECDHKey_JWK);
					res.json({ message: 'Email sent successfully', PublicRSAKey_JWK, PublicECDHKey_JWK});
				} catch (error) {
					res.status(500).send('Error sending email');
				}
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

module.exports = router;