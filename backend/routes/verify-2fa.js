const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { verifyOTP } = require('../utils/verifyOTP.js');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

async function generateTokenAndStoreKeys(personId, voteId, keys) {
	const token = generateToken(personId, voteId);
	keyStore[personId] = { ECDH: keys.ECDH, DigSig: keys.DigSig };
	return token;
}

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, keys } = req.body;
	const otpData = OTPStore.getOTP(personId);
	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		const token = await generateTokenAndStoreKeys(personId, voteId, keys);
		res.json({
			token: token,
			message: otpVerificationResult.message,
		});
	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}
});

module.exports = router;