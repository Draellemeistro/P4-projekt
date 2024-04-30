import crypto from 'crypto';
import fs from 'fs';
import JSEncrypt from 'jsencrypt';


const RSACrypto = {
	write: function writeToFile(filename, data) {
		fs.writeFileSync(filename, data);
	},
	request: async function requestPublicKey() {
		const serverIP = '192.168.0.113';
		const 	serverPort = '3030';
		const response =  fetch(`https://${serverIP}:${serverPort}/rsa-public-key`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
		},});
		if (response.ok) {
			const data = await response.json();
			console.log(data);
			return data; } else {
			console.error('Failed to fetch candidates');
		}

		//sessionStorage.setItem('serverPublicKeyRSA', response.data);

	},
	encrypt: function encryptWithPublicKey(message, publicKey) {
		// Check if the message and publicKey are valid
		if (typeof message !== 'string' || message.length === 0) {
			console.error('Invalid message. Please provide a non-empty string.');
			return false;
		}
		if (typeof publicKey !== 'string' || publicKey.length === 0) {
			console.log(publicKey);
			console.error('Invalid public key. Please provide a non-empty string.');
			return false;
		}

		const encrypt = new JSEncrypt();
		encrypt.setPublicKey(publicKey);
		const encryptedMessage = encrypt.encrypt(message);

		// Check if the encryption was successful
		if (!encryptedMessage) {
			console.error('Failed to encrypt the message. Please check your public key and the message.');
			return false;
		}

		return encryptedMessage;
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