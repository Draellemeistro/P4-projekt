import crypto from 'crypto';
import fs from 'fs';

const RSACrypto = {
	write: function writeToFile(filename, data) {
		fs.writeFileSync(filename, data);
	},
	request: async function requestPublicKey() {
		const serverIP = '192.168.0.113';
		const 	serverPort = '3030';
		const response = await fetch(`https://${serverIP}:${serverPort}/rsa-public-key`);
		sessionStorage.setItem('serverPublicKeyRSA', response.data);
		return response.data;
	},
	encrypt: function encryptWithPublicKey(message, publicKey) {
		const buffer = Buffer.from(message, 'utf8');
		const encrypted = crypto.publicEncrypt(publicKey, buffer);
		return encrypted.toString('base64');
	},
	decrypt: function decryptWithPrivateKey(encryptedMessage, privateKey) {
		const buffer = Buffer.from(encryptedMessage, 'base64');
		const decrypted = crypto.privateDecrypt(privateKey, buffer);
		return decrypted.toString('utf8');
	},

	webCryptoTest: function webCryptoTest() {
		// Check if the Web Cryptography API is available
		if (window.crypto && window.crypto.subtle) {
			// Generate a RSA-PSS key pair
			 return window.crypto.subtle.generateKey(
				{
					name: "RSA-PSS",
					modulusLength: 2048, // can be 1024, 2048, or 4096
					publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
					hash: "SHA-256" // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
				},
				true, // whether the key is extractable (i.e. can be used in exportKey)
				["sign", "verify"] // can be any combination of "sign" and "verify"
			)
				.then(keyPair => {
					// Returns a keypair object containing the public and private keys
					console.log(keyPair);
					return keyPair;
				})
				.catch(err => {
					console.error(err);
				});
		} else {
				return 'Web Cryptography API is not available in your browser.'
		}
	}
};

export default RSACrypto;