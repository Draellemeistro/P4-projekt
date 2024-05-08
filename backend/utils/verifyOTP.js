function verifyOTP(otpData, twoFactorCode, currentTime) {
	if (otpData) {
		const isOTPMatch = twoFactorCode === otpData.otp;
		const isOTPExpired = currentTime > otpData.timestamp + 5 * 60 * 1000; // Check if more than 5 minutes have passed

		if (isOTPMatch && !isOTPExpired) {
			return { isValid: true, message: 'User verified' };
		} else {
			return { isValid: false, message: 'Invalid OTP' };
		}
	} else {
		return { isValid: false, message: 'Invalid OTP' };
	}
}
module.exports = { verifyOTP }