//import crypto from 'crypto';
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
					const importedKey = await window.crypto.subtle.importKey(
						'jwk',
						data,
						{
							name: 'RSA-OAEP',
							hash: 'SHA-256'
						},
						true,
						['encrypt']
					);
					//export JWK formatted RSA public key and store as string in sessionStorage
					const exportedKey = await window.crypto.subtle.exportKey('jwk', importedKey);
					const keyString = JSON.stringify(exportedKey);
					sessionStorage.setItem('serverPublicKeyRSA', keyString);
					return importedKey;
				} else {
					console.error('Failed to get public key');
				}
				//sessionStorage.setItem('serverPublicKeyRSA', publicKeyRSA);

			}
		,
			encrypt: async function encryptWithPublicKey(message, publicKey) {
				const encoder = new TextEncoder();
				// Check if the message and publicKey are valid
				if (typeof message !== 'string' || message.length === 0) {
					console.error('Invalid message. Please provide a non-empty string.');
					return false;
				}

				if (typeof publicKey !== 'string' || publicKey.length === 0) {
					console.error('Invalid public key. checking sessionStorage for public key');
					const keyString = sessionStorage.getItem('serverPublicKeyRSA');
					if (!keyString) {
						console.error('!--No public key found in sessionStorage.--!\n' +
							'!--Please make sure the key is stored correctly.--!');
						console.log('publicKey: ', publicKey);
						console.log('keyString', keyString);
						return false;
					} else {
						const jwkKey = JSON.parse(keyString);
						publicKey = await window.crypto.subtle.importKey(
							'jwk',
							jwkKey,
							{
								name: 'RSA-OAEP',
								hash: 'SHA-256'
							},
							true,
							['encrypt']
						);
					}
				}
				const encryptionData = encoder.encode(message);
				const encryptedMessage = await window.crypto.subtle.encrypt(
					{
						name: 'RSA-OAEP'
					},
					publicKey,
					encryptionData
				);

				// Convert encryptedMessage to base64
				const encryptedMessageArray = new Uint8Array(encryptedMessage);
				const encryptedMessageString = Array.from(encryptedMessageArray).map(b => String.fromCharCode(b)).join('');
				return btoa(encryptedMessageString);
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


