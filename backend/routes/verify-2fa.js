import express from 'express';
import { otpStore } from '../utils/otpStore';
const router = express.Router();

router.post('/', async (req, res) => {
	const { twoFactorCode, personId, voteId } = req.body;
	const otpData = otpStore[personId];

	if (otpData) {
		const isOTPMatch = twoFactorCode === otpData.otp;
		const isOTPExpired = Date.now() > otpData.timestamp + 5 * 60 * 1000; // Check if more than 5 minutes have passed

		if (isOTPMatch && !isOTPExpired) {
			res.json({ message: 'User verified' });
			console.log('User verified');
		} else {
			res.status(400).json({ message: 'Invalid OTP' });
		}
	} else {
		res.status(400).json({ message: 'Invalid OTP' });
	}
});

export default router