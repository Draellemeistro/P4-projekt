import express from 'express';
const OTPStore = require('../utils/otpStore.js');
import { keyStore } from '../utils/keyStore.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
const verifyOTP = require('../utils/verifyOTP.js');

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