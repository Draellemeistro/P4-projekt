const { verifyOTP } = require('../utils/verifyOTP.js')

test('verifyOTP - valid OTP', () => {
	const otpData = { otp: '123456', timestamp: Date.now() }
	const twoFactorCode = '123456'
	const currentTime = Date.now()

	const result = verifyOTP(otpData, twoFactorCode, currentTime)

	expect(result).toEqual({ isValid: true, message: 'User verified' })
})

test('verifyOTP - invalid OTP', () => {
	const otpData = { otp: '123456', timestamp: Date.now() }
	const twoFactorCode = '654321'
	const currentTime = Date.now()

	const result = verifyOTP(otpData, twoFactorCode, currentTime)

	expect(result).toEqual({ isValid: false, message: 'Invalid OTP' })
})

test('verifyOTP - expired OTP', () => {
	const otpData = { otp: '123456', timestamp: Date.now() - 6 * 60 * 1000 }
	const twoFactorCode = '123456'
	const currentTime = Date.now()

	const result = verifyOTP(otpData, twoFactorCode, currentTime)

	expect(result).toEqual({ isValid: false, message: 'Invalid OTP' })
})