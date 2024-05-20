// Mock the modules
jest.mock('../../utils/otpStore.js');
jest.mock('../../utils/verifyOTP.js');
jest.mock('../../utils/jwt.js');

const { handleVerify2FA } = require('../../routes/verify-2fa');
const OTPStore = require('../../utils/otpStore.js');
const { verifyOTP } = require('../../utils/verifyOTP.js');
const { generateToken } = require('../../utils/jwt.js');

// Clear all mocks after each test
afterEach(() => {
	jest.clearAllMocks();
});

// Now you can use .mockReturnValue on the functions
// Test for successful OTP verification
test('handleVerify2FA successfully verifies OTP', async () => {
	OTPStore.getOTP.mockReturnValue({ otp: '123456', expiry: Date.now() + 30000 });
	verifyOTP.mockReturnValue({ isValid: true, message: 'OTP verified' });
	generateToken.mockReturnValue('token');

	const result = await handleVerify2FA('123456', 'personId', 'voteId', { ECDH: 'ECDHKey', DigSig: 'DigSigKey' });

	expect(result.status).toEqual(200);
	expect(result.body).toHaveProperty('token');
	expect(result.body).toHaveProperty('message', 'OTP verified');
});

// Test for expired OTP
test('handleVerify2FA fails with expired OTP', async () => {
	OTPStore.getOTP.mockReturnValue({ otp: '123456', expiry: Date.now() - 30000 });

	const result = await handleVerify2FA('123456', 'personId', 'voteId', { ECDH: 'ECDHKey', DigSig: 'DigSigKey' });

	expect(result.status).toEqual(400);
	expect(result.body).toHaveProperty('message', 'OTP expired');
});

// Test for incorrect OTP
test('handleVerify2FA fails with incorrect OTP', async () => {
	OTPStore.getOTP.mockReturnValue({ otp: '123456', expiry: Date.now() + 30000 });

	const result = await handleVerify2FA('654321', 'personId', 'voteId', { ECDH: 'ECDHKey', DigSig: 'DigSigKey' });

	expect(result.status).toEqual(400);
	expect(result.body).toHaveProperty('message', 'OTP verification failed');
});