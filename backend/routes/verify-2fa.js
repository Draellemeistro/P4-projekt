import express from 'express';
import { otpStore } from '../utils/otpStore.js';
import { keyStore } from '../utils/keyStore.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // for some reason this is needed to get the current directory

const publicRSAKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyRSA.pem'),'utf8');
const publicECDHKey = fs.readFileSync(path.join(__dirname, '../utils/keys/serverPublicKeyECDH.pem'),'utf8');


router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, pubKey } = req.body;
	const otpData = otpStore[personId];
	keyStore[personId] = pubKey;

	if (otpData) {
		const isOTPMatch = twoFactorCode === otpData.otp;
		const isOTPExpired = Date.now() > otpData.timestamp + 5 * 60 * 1000; // Check if more than 5 minutes have passed

		if (isOTPMatch && !isOTPExpired) {
			res.json({
				message: 'User verified',
				publicRSAKey: publicRSAKey,
				publicECDHKey: publicECDHKey
			});
			console.log('User verified');

		} else {
			res.status(400).json({ message: 'Invalid OTP' });
		}
	} else {
		res.status(400).json({ message: 'Invalid OTP' });
	}
});

export default router