const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { verifyOTP } = require('../utils/verifyOTP.js');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const { generateToken } = require('../utils/jwt');

const router = express.Router();


//const PublicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'), 'utf8');
//const PublicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.json'), 'utf8');

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, keys } = req.body;
	const otpData = OTPStore.getOTP(personId);
	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		let clientKeyECDH;
		let clientKeyDigSig;
		if (typeof keys === 'string') {
			const keysParsed = JSON.parse(keys);
		console.log('User verified');
		const token = generateToken(personId, voteId);
		res.json({
			token: token,
			message: otpVerificationResult.message,
		});

		keyStore[personId] = { ECDH: keysParsed.ECDH, DigSig: keysParsed.DigSig };

	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}}
});
module.exports = router;