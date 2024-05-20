const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { verifyOTP } = require('../utils/verifyOTP.js');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

async function generateTokenAndStoreKeys(personId, voteId, keys) {
	const token = generateToken(personId, voteId);
	keyStore[personId] = { ECDH: keys.ECDH, DigSig: keys.DigSig };
	return token;
}

async function handleVerify2FA(twoFactorCode, personId, voteId, keys) {
	const otpData = OTPStore.getOTP(personId);
	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		const token = await generateTokenAndStoreKeys(personId, voteId, keys);
		return {
			status: 200,
			body: {
				token: token,
				message: otpVerificationResult.message,
			},
		};
	} else {
		return {
			status: 400,
			body: { message: otpVerificationResult.message },
		};
	}
}

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, keys } = req.body;
	const result = await handleVerify2FA(twoFactorCode, personId, voteId, keys);
	res.status(result.status).json(result.body);
});

module.exports =  router;