const { generateOTP } = require('../utils/generateOTP.cjs');

test('generateOTP - should generate a six-character OTP', () => {
	const otp = generateOTP();

	// Check if otp is a six-character string
	expect(typeof otp).toBe('string');
	expect(otp).toHaveLength(6);

	// Check if otp is a valid hexadecimal string
	expect(/^[0-9a-f]{6}$/i.test(otp)).toBe(true);
});