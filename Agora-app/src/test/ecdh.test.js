import { test, assert, beforeEach } from 'vitest'
import ECDH from '../utils/cryptoProtocols/encryptionECDH.js';
import jsdomGlobal from 'jsdom-global';

jsdomGlobal();
const dummyKeyString = '{"crv":"P-521","ext":true,"key_ops":["deriveKey","deriveBits"],"kty":"EC","x":"AdYvvEQwZXZdXR4iDr2c3SibRnME4aZd2zvXWsYsomd3k7FYBzvvXlj9dYOKISNY-3Fy9OxSzXatd9Y3jtCslgny","y":"AeEO7TDgQIOhoTobohPLWL4vGePOMMSvPJ3V0DzVLxGNQAlhXbTZ4Wz_Y4EX604iDjC_1EhxlSyk121_UhsuLPP8"}'

const { subtle } = require('webcrypto');
Object.defineProperty(window, 'crypto', { value: { subtle } });
function reset() {
	ECDH.serverKey = null;
	ECDH.serverPubKeyVariant = null;
	ECDH.pubKey = null;
	ECDH.privKey = null;
}
beforeEach(async () => {
	reset();
	await ECDH.genKeys();
	await ECDH.saveServerKey(dummyKeyString);
});

test('ECDH genKeys function', async () => {
	assert(ECDH.pubKey !== null, 'Public key should not be null after initialization');
	assert(ECDH.privKey !== null, 'Private key should not be null after initialization');
	assert(ECDH.pubKey instanceof CryptoKey, 'Public key should be of type CryptoKey after initialization');
	assert(ECDH.privKey instanceof CryptoKey, 'Private key should be of type CryptoKey after initialization');
});
test('ECDH exportKeyToString() should return a string of the key', async () => {
	const result = await ECDH.exportKeyToString();
	assert(typeof result === 'string', 'exportKeyToString should return a string');
});

test('ECDH exportKeyToString() should error if the input is not a CryptoKey', async () => {
	const invalidInput = "not a CryptoKey";
	try {
		await ECDH.exportKeyToString(invalidInput);
		assert.fail('Expected error was not thrown');
	} catch (error) {
		assert(error instanceof Error, 'Thrown error should be an instance of Error');
	}
});

test('ECDH saveServerKey function should save a CryptoKey to the serverKey field', async () => {
	assert(ECDH.serverKey !== null, 'Server public key should not be null after saving');
	assert(ECDH.serverKey instanceof CryptoKey, 'Server public key should be of type CryptoKey after saving');
});


test('ECDH deriveSecret function should return a type CryptoKey', async () => {
	await ECDH.saveServerKey(dummyKeyString);
	const secretKey = await ECDH.deriveSecret();
	assert(secretKey !== null, 'Secret key should not be null after derivation');
	console.assert(secretKey instanceof CryptoKey, 'secret key should be of type CryptoKey after saving');
});


test('ECDH encryptMessage function', async () => {
	const message = 'Hello, World!';
	await ECDH.saveServerKey(dummyKeyString);
	const secretKey = await ECDH.deriveSecret();
	const encryptedObject = await ECDHTESTENCRYPT(message, secretKey);
	assert(encryptedObject !== null, 'encryptedObject should not be null after encryption');
	assert(typeof encryptedObject === 'object', 'encryptedObject should be an object after encryption');
	assert(encryptedObject.encryptedMessage instanceof ArrayBuffer, 'encryptedObject.encryptedMessage should be an ArrayBuffer after encryption');
	assert(encryptedObject.ivValue instanceof Uint8Array, 'encryptedObject.ivValue should be a Uint8Array after encryption');
});

test('ECDH saveServerKeyVariant returns the same CryptoKey as saveServerKeyVariant function', async () => {
	const compareServerKey = await ECDH.saveServerKeyVariant(dummyKeyString);
	assert(compareServerKey !== null, 'Server public key should not be null after saving');
	assert(compareServerKey instanceof CryptoKey, 'Server public key should be of type CryptoKey after saving')
	if (compareServerKey !== ECDH.serverKey) {
		console.log('compareServerKey:', await ECDH.serverPubKeyVariant);
		console.log('ECDH.serverKey:', await ECDH.serverKey);
	}
	assert(await ECDH.serverPubKeyVariant === await ECDH.serverKey, 'Server public key should be the same as the one saved with saveServerKey');
});


async function ECDHTESTENCRYPT(message, sharedSecret) {
	const encoder = new TextEncoder(); // Check if the message and publicKey are valid
	if (typeof message !== 'string' || message.length === 0) {
		console.error('Invalid message. Please provide a non-empty string.');
		return false;
	}
	const ivValue = new Uint8Array([35, 200, 79, 25, 179, 77, 242, 244, 53, 210, 145, 45]); //needed for decryption
	const encryptedMessage = await window.crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: ivValue,
		},
		sharedSecret,
		encoder.encode(message)
	);
	return {
		encryptedMessage: encryptedMessage,
		ivValue: ivValue
	}
}