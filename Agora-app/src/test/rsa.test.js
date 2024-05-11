import { test, assert, beforeEach } from 'vitest';
import RSA from '../utils/cryptoProtocols/encryptionRSA.js';
import jsdomGlobal from 'jsdom-global';
jsdomGlobal();

const { subtle } = require('webcrypto');
Object.defineProperty(window, 'crypto', { value: { subtle } });


const dummyKeyString = "{\"kty\":\"RSA\",\"n\":\"sJu6dIgG1qWSrAwo1rPPvTRi_EuQ9tK-yYbds8Owsc_8ao4OffarhCHZuDxx0V4qFsodWydhg6SqPLjVqXNfxxvwLrnsTQWqnhzna__LJPQ0X8NbHvDW_rEoU9emN9-4u0NMXESG2W1xVthXPgjE3ZB9qksXdaTPqJPwGxP9Z-6P9xOlRNPVI_S073BamsAlWIZSrYKsxvlFWmCKcVXEm6Zugj1ZS_gYRRFfj9X18LmR2V5NZ8hTLig1sD5014i8cjkfnKnnwoUJsD9J2XHvYMJfQIc8LToPu-FfTJrLw7ObfkjNbhFz4MhEsS0OjPCRY_xOp6GDKz1eW9_7xDi4yICyKjURTM_3SEw2sb34fUMTKLv7Dl8SDbW1L5Yjl82vaCWnx71o5w5gXsXC9fdzNu8AgkJaeVUmjZ6-JLxgqU-B9kG6Z-WtLnu3EQnuyud9hzPSBgEHrIw2Ki1XsVxpIU_EQ-d6pJso5sF4oGINQuN6Kdi_g8b89Qj3uTD4rrxiJfDEkD9kcd9EtTqbopdJP7F2-EfD0pAgfBDMEZgEdSKzetjR4DlsJJ7-OhNtPBDYgZzGYnCOwri6u11hKR_Jm6Kx9nuM0Ss7_c_d261IxhSUZNX06P9ZDCo9BcCvpXSb7uoAOlpNnbMhx8BElT-QhgWoo9_nXCpQS4CSzZbSx9k\",\"e\":\"AQAB\"}"
beforeEach(async () => {
	RSA.serverKey = null;
	RSA.serverKeyString = null;
});

test('RSA saveServerKey function should save a CryptoKey to the serverKey field', async () => {
	await RSA.saveServerKey(dummyKeyString);


	assert(RSA.serverKeyString !== null, 'Server public key string should not be null after saving');
	assert(typeof RSA.serverKeyString === 'string', 'Server public key string should be a string after saving');
	assert(RSA.serverKeyString === dummyKeyString, 'Server public key string should be equal to the dummy key string');

	assert(RSA.serverKey !== null, 'Server public key should not be null after saving');
	assert(RSA.serverKey instanceof CryptoKey, 'Server public key should be of type CryptoKey after saving');
});

//doesn't work because of test environment
// est('RSA convertToBase64 function should return a string', () => {
// 	const encryptedMessage = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
// 	const encryptedMessageString = RSA.convertToBase64(encryptedMessage);
// 	assert(typeof encryptedMessageString === 'string', 'Encrypted message should be a string');
// });

test('RSA encrypt function should return an ArrayBuffer to be handled afterwards', async () => {
	const message = 'Hello, World!';
	await RSA.saveServerKey(dummyKeyString);
	const encryptedMessage = await RSA.encrypt(message);
	assert(encryptedMessage !== null, 'Encrypted message should not be null');
	assert (encryptedMessage instanceof ArrayBuffer, 'Encrypted message should be a string');
	// Convert encryptedMessage to base64 and return it as a string
	//assert(typeof encryptedMessage === 'string', 'Encrypted message should be a string');
});