const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const path = require('path');
const fs = require('fs');
const { verifyOTP } = require('../utils/verifyOTP.js');
const { pem2jwk } = require('pem-jwk');
const serverRSA = require('../utils/cryptoFunctions/serverRSA');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigitalSignatures');

const router = express.Router();


//const PublicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'), 'utf8');
//const PublicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.json'), 'utf8');

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, pubKey } = req.body;
	const otpData = OTPStore.getOTP(personId);
	keyStore[personId] = pubKey;
	const PublicRSAKey_JWK = await serverRSA.exportKeyToString();
	const PublicECDHKey_JWK = await serverECDH.exportKeyToString();
	const PublicDigSigKey_JWK = await serverDigSig.exportKeyToString();

	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {

		const pubKeys = { RSA: PublicRSAKey_JWK, ECDH: PublicECDHKey_JWK, DigSig: PublicDigSigKey_JWK };
		res.json({
			message: otpVerificationResult.message,
			pubKeys: pubKeys,
		});
		console.log('User verified');
	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}
});
module.exports = router;