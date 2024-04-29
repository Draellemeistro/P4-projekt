import crypto from 'crypto';

export function generateOTP() {
	return crypto.randomBytes(3).toString('hex');
}