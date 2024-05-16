const crypto = require('crypto');
const serverECDH = require('../utils/cryptoFunctions/serverECDH.js');
const fs = require('fs');
const path = require('path');

const mockClientPublicKey = "{\"key_ops\":[],\"ext\":true,\"kty\":\"EC\",\"x\":\"ARxeIofoFJW7om95Xg-NsHkbWsYE8ZrOhkvS6g4JkWNBUSyqg67Wbl7fcH71cZdZMGyjKF2y6DJChTjMI_OQlFXz\",\"y\":\"AetEYhZyorx2sl3S66TBDFgTymRDaRFGcq8bTFc0fyw2t--vwI7xV0xMycs-pxvE1gzsElFyY5lbWtDBACBinc6p\",\"crv\":\"P-521\"}"
// Mock the fs.readFileSync function
jest.mock('fs', () => ({
	readFileSync: jest.fn(),
}));

describe('serverECDH', () => {
	beforeEach(async () => {
		// Clear all instances and calls to constructor and all methods:
		await serverECDH.genKeys();
	});

	test('genKeys function', async () => {
		expect(serverECDH.pubKey).not.toBeNull();
		expect(serverECDH.privKey).not.toBeNull();
	});

	test('importClientKey function', async () => {
		await serverECDH.importClientKey(mockClientPublicKey);
		expect(serverECDH.clientPubKey).not.toBeNull();
		expect(serverECDH.clientPubKey).toBeInstanceOf(CryptoKey);
	});

	test('keyImportTemplateECDH with JWK / Parsed string', async () => {
		const keyStringJWK = JSON.parse(mockClientPublicKey);
		const key1 = await serverECDH.importECDH(keyStringJWK, true);
		expect(key1).not.toBeNull();
		expect(key1).toBeInstanceOf(CryptoKey);
	});

	test('keyImportTemplateECDH with string', async () => {
		const key2 = await serverECDH.importECDH(mockClientPublicKey, true);
		expect(key2).not.toBeNull();
		expect(key2).toBeInstanceOf(CryptoKey);
	});

	test('keyImportTemplateECDH wrong key type (public private)', async () => {
		try {
			// Test for invalid key. Should not be able to import a public key as a private key
			await serverECDH.importECDH(mockClientPublicKey, false);
		} catch (error) {
			expect(error).toBeInstanceOf(DOMException);
		}
	});

	test('exportKeyToString function', async () => {
		const result = await serverECDH.exportKeyToString();
		expect(typeof result).toBe('string');
	});

	test('deriveSecret function', async () => {
		await serverECDH.importClientKey(mockClientPublicKey);
		const secretKey = await serverECDH.deriveSecret();
		expect(secretKey).not.toBeNull();
		expect(secretKey).toBeInstanceOf(CryptoKey);
	});

	test('handleEncryptedMessage function', async () => {
		//todo add test
	});



});