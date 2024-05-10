import express from 'express';
import { otpStore } from '../utils/otpStore.js';
import { keyStore } from '../utils/keyStore.js';
const router = express.Router();
import serverECDH from '../utils/cryptoFunctions/serverECDH.cjs';
import serverRSA from '../utils/cryptoFunctions/serverRSA.cjs';




router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId, pubKey } = req.body;
	const otpData = otpStore[personId];
	keyStore[personId] = pubKey;
	serverECDH.clientPubKeyString = pubKey;
	// ADD clientPubKeyRSA to keyStore
	if (otpData) {
		const isOTPMatch = twoFactorCode === otpData.otp;
		const isOTPExpired = Date.now() > otpData.timestamp + 5 * 60 * 1000; // Check if more than 5 minutes have passed

		if (isOTPMatch && !isOTPExpired) {
			res.json({
				message: 'User verified',
				publicRSAKey: serverRSA.serverPubKey,
				publicECDHKey: serverECDH.serverPubKeyJWK,
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