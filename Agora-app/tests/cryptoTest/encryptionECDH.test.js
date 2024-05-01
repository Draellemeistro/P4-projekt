// Test for encryptionECDH.js
const { getPublicKey, deriveSecretKey, requestServerPublicKeyECDH, encryptMessageECDH, performECDHAndEncryptBallot } = require('../../src/utils/encryptionECDH.js');
describe('encryptionECDH', () => {
	test('getPublicKey returns a public key', () => {
		const publicKey = getPublicKey();
		expect(typeof publicKey).toBe('string'); // if public key is a string
		expect(publicKey).toHaveLength(64); // if public key is 64 characters long
	});

	test('computeSharedSecret returns a shared secret', () => {
		const sharedSecret = deriveSecretKey();
		expect(typeof sharedSecret).toBe('string'); // if shared secret is a string
		// Add more assertions based on what you expect from computeSharedSecret
	});

	test('requestServerPublicKeyECDH returns a server public key', () => {
		const serverPublicKey = requestServerPublicKeyECDH();
		expect(serverPublicKey).toBeDefined();
		// Add more assertions based on what you expect from requestServerPublicKeyECDH
	});

	test('encryptMessageECDH returns an encrypted message', () => {
		const message = 'test message';
		const sharedSecret = 'test secret';
		const encryptedMessage = encryptMessageECDH(message, sharedSecret);
		expect(encryptedMessage).toBeDefined();
		// Add more assertions based on what you expect from encryptMessageECDH
	});

	test('performECDHAndEncryptBallot returns an encrypted ballot', async () => {
		const ballot = 'test ballot';
		const encryptedBallot = await performECDHAndEncryptBallot(ballot);
		expect(encryptedBallot).toBeDefined();
		// Add more assertions based on what you expect from performECDHAndEncryptBallot
	});
});