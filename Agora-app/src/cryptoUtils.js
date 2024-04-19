/**
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#rsa_key_pair_generation
 */
const crypto = require('crypto');
const fs = require('fs');
export let keyPair = window.crypto.subtle.generateKey(
	{
		name: "RSA-OAEP",
		modulusLength: 4096,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: "SHA-256"
	},
	true,
	["encrypt", "decrypt"] // other usages: sign, verify, derive new key, deriving bits, wrap a key, unwrap a key
);
export function genKeyPairCrypto() {
	// Generates an object where the keys are stored in properties `privateKey` and `publicKey`
	const keyPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096, // bits - standard for RSA keys
		publicKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		},
		privateKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		}
	});

	// Create the public key file
	fs.writeFileSync(__dirname + '/id_rsa_pub.pem', keyPair.publicKey);

	// Create the private key file
	fs.writeFileSync(__dirname + '/id_rsa_priv.pem', keyPair.privateKey);

	// Return the keyPair object
	return keyPair;
}

const cryptoUtils = {
	generateKeyPair: async function() {
		return await window.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: "SHA-256"
			},
			true,
			["encrypt", "decrypt"]
		);
	},


	encrypt: async function(publicKey, data) {
		let encoded = new TextEncoder().encode(data);
		return await window.crypto.subtle.encrypt(
			{
				name: "RSA-OAEP"
			},
			publicKey,
			encoded
		);
	},

	decrypt: async function(privateKey, data) {
		return await window.crypto.subtle.decrypt(
			{
				name: "RSA-OAEP"
			},
			privateKey,
			data
		);
	},

	arrayBufferToString: function(buffer) {
		return new TextDecoder().decode(new Uint8Array(buffer));
	},

	stringToArrayBuffer: function(str) {
		return new TextEncoder().encode(str);
	},

	arrayBufferToBase64: function(buffer) {
		let binary = '';
		let bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	},

	base64ToArrayBuffer: function(base64) {
		let binary_string = window.atob(base64);
		let len = binary_string.length;
		let bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
};

export default cryptoUtils;