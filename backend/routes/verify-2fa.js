const express = require('express');
const OTPStore = require('../utils/otpStore.js');
const { keyStore } = require('../utils/keyStore.js');
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const fs = require('fs');
const verifyOTP = require('../utils/verifyOTP.cjs');

const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // for some reason this is needed to get the current directory

const publicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'),'utf8');
const publicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.pem'),'utf8');
router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, pubKey } = req.body;
	const otpData = OTPStore.getOTP(personId);
	keyStore[personId] = pubKey;

	const otpVerificationResult = verifyOTP(otpData, twoFactorCode, Date.now());

	if (otpVerificationResult.isValid) {
		res.json({
			message: otpVerificationResult.message,
			publicRSAKey: publicRSAKey,
			publicECDHKey: publicECDHKey
		});
		console.log('User verified');
	} else {
		res.status(400).json({ message: otpVerificationResult.message });
	}
});
export default router;