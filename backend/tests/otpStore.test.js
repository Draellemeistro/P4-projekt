// otpStore.test.js
const OTPStore = require('../utils/otpStore.js');

test('OTPStore - should add and retrieve OTP data', () => {
	const personId = 'testPersonId';
	const otpData = { otp: '123456', timestamp: Date.now() };

	OTPStore.addOTP(personId, otpData);
	const retrievedOTPData = OTPStore.getOTP(personId);

	expect(retrievedOTPData).toEqual(otpData);
});

test('OTPStore - should delete OTP data', () => {
	const personId = 'testPersonId';
	const otpData = { otp: '123456', timestamp: Date.now() };

	OTPStore.addOTP(personId, otpData);
	OTPStore.deleteOTP(personId);
	const retrievedOTPData = OTPStore.getOTP(personId);

	expect(retrievedOTPData).toBeUndefined();
});