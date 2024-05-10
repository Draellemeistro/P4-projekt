const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const path = require('path');
const fs = require('fs');
const { verifyOTP } = require('../utils/verifyOTP.js');
const { pem2jwk } = require('pem-jwk');

const router = express.Router();


const PublicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'), 'utf8');
const PublicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.json'), 'utf8');

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, pubKey } = req.body;
	const otpData = OTPStore.getOTP(personId);
	keyStore[personId] = pubKey;

	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		const PublicRSAKey_JWK = pem2jwk(PublicRSAKey);
		const PublicECDHKey_JWK = JSON.parse(PublicECDHKey);
		console.log('PublicRSAKey_JWK: ', PublicRSAKey_JWK);

		res.json({
			message: otpVerificationResult.message,
			PublicRSAKey_JWK, PublicECDHKey_JWK
		});
		console.log('User verified');
	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}
});
module.exports = router;