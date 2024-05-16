const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { verifyOTP } = require('../utils/verifyOTP.js');
const { generateToken } = require('../utils/jwt');

const router = express.Router();


router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, keys } = req.body;
	const otpData = OTPStore.getOTP(personId);
	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		if (typeof keys === 'string') {
			const keysParsed = JSON.parse(keys);
		console.log('User verified');
		const token = generateToken(personId, voteId);
		res.json({
			token: token,
			message: otpVerificationResult.message,
		});

		keyStore[personId].addKeys(keysParsed.ECDH, keysParsed.DigSig) // TODO tjek sådan her eller mere sådan her keyStore.addKeys(personId, keysParsed.ECDH, keysParsed.DigSig)

	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}}
});
module.exports = router;