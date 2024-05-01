import crypto from 'crypto';
// eslint-disable-next-line no-unused-vars
//import { c } from 'vite/dist/node/types.d-aGj9QkWt.js';
//import JSEncrypt from 'jsencrypt';


const RSACrypto = {
	askForDecryption: async function askForDecryption(plainTextMessage, encryptedMessage) {
		const serverIP = '192.168.0.113';
		const serverPort = '3030';
		try {
			const response = await fetch(`https://${serverIP}:${serverPort}/decrypt-RSA-message-Test`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ plainTextMessage, encryptedMessage }),
			});
			if (!response.ok) {
				console.error('Server responded with status', response.status);
			} else {
				const data = await response.json();
				console.log(data);
				if (data === plainTextMessage) {
					console.log('Decryption successful');
				} else {
					console.log('received: ', data, 'expected: ', plainTextMessage);
					console.log('problem might be in the formatting/encoding of the message');
					console.error('Decryption failed');
				}
				return data;
			}
	} catch (error) {
			console.error('Failed to fetch', error);
		}
	},
			request: async function requestPublicKey() {
				const serverIP = '192.168.0.113';
				const serverPort = '3030';
				const response = await fetch(`https://${serverIP}:${serverPort}/rsa-public-key`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					const publicKeyRSA = typeof data === 'string' ? data : data.toString();
					sessionStorage.setItem('serverPublicKeyRSA', publicKeyRSA);
					return publicKeyRSA;
				} else {
					console.error('Failed to get public key');
				}
				//sessionStorage.setItem('serverPublicKeyRSA', publicKeyRSA);

			}
		,
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
				// Encrypt the message
				const encoder = new TextEncoder();
				const buffer = encoder.encode(message);
				const encryptedMessage = crypto.publicEncrypt({
						key: publicKey,
						padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
						oaepHash: "sha256",
					},
					buffer
				);
				// Check if the encryption was successful
				if (!encryptedMessage) {
					console.error('Failed to encrypt the message. Please check your public key and the message.');
					return false;
				}
				const decoder = new TextDecoder();
				return btoa(decoder.decode(encryptedMessage));
			}
		,
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
		}
		;

		export default RSACrypto;


