const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { verifyOTP } = require('../utils/verifyOTP.js');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const { generateToken } = require('../utils/jwt');

const router = express.Router();


//const PublicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'), 'utf8');
//const PublicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.json'), 'utf8');

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, keys } = req.body;
	console.log('personId: ', personId);
	const otpData = OTPStore.getOTP(personId);
	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());
	console.log('request recieved')
	if (otpVerificationResult.isValid) {
		console.log('User verified OTP')
		let clientKeyECDH;
		let clientKeyDigSig;
		console.log('keys', keys.ECDH, keys.DigSig)
		console.log('User verified');
		const token = generateToken(personId, voteId);
		keyStore[personId] = { ECDH: keys.ECDH, DigSig: keys.DigSig };
		console.log('keys', keyStore[personId])
		res.json({
			token: token,
			message: otpVerificationResult.message,
		});

	} else {
		console.log(otpVerificationResult.message)
		res.status(400).json({ message: otpVerificationResult.message });
	}
});
module.exports = router;