//import crypto from 'crypto';
// eslint-disable-next-line no-unused-vars
//import { c } from 'vite/dist/node/types.d-aGj9QkWt.js';
//import JSEncrypt from 'jsencrypt';

// This file contains methods for RSA encryption and importing the public key from the server:
// - requestPublicKey: fetches the RSA public key from the server and stores it in sessionStorage
// - keyImportTemplateRSA: imports the RSA public key from the server
// - askForDecryptionTest: sends a test message to the server for decryption
// - encrypt: encrypts a message with the RSA public key
// - webCryptoTest: generates a RSA-PSS key pair (not implemented yet. Might not be needed.)
import { fetchKeyRSA } from './apiService.js';
import { DecryptTestRSA } from './apiServiceDev.js';

const RSACrypto = {

		// Request the RSA public key from the server, make key object of it and
		// returns a CryptoKey object and stores a string copy of it in sessionStorage
		request: async function requestPublicKey() {
			const response = await fetchKeyRSA();
			if (response.ok) {
				const data = await response.json();
				const importedKey = await this.keyImportTemplateRSA(data);
				//export JWK formatted RSA public key for later use TODO: maybe not necessary to import and export key yet
				const exportedKey = await window.crypto.subtle.exportKey('jwk', importedKey);
				const keyString = JSON.stringify(exportedKey);
				sessionStorage.setItem('serverPublicKeyRSA', keyString);
				return keyString; // maybe change this to keyString
			} else {
				console.error('Failed to get public key');
			}
		},

		// Avoids errors from fat-fingering by using a template for the key import
		keyImportTemplateRSA: async function keyImportTemplateRSA(keyString) {
			return  window.crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'RSA-OAEP',
					hash: 'SHA-256'
				},
				true,
				['encrypt']
			);
		},


			encrypt: async function encryptWithPublicKey(message, publicKey) {
				const encoder = new TextEncoder(); // Used to encode the message to an ArrayBuffer for encryption
				let jwkKey;
				// Check if the message and publicKey are valid
				if (typeof message !== 'string' || message.length === 0) {
					console.error('Invalid message. Please provide a non-empty string.');
					return false;
				}

				if (typeof publicKey !== 'string' || publicKey.length === 0) {
					console.error('No or Invalid public key provided: ', typeof publicKey);
					const keyString = sessionStorage.getItem('serverPublicKeyRSA');
					if (!keyString) {
						console.error('Neither provided key: ',typeof publicKey,' nor stored key: ',keyString ,' is valid. Please provide a valid public key');
						return false;
					} else {
						jwkKey = JSON.parse(keyString);
					}
				} else {
					jwkKey = JSON.parse(publicKey);
				}
				//import RSA public key TODO: check if this can be handled by keyImportTemplateRSA.
				publicKey = await this.keyImportTemplateRSA(jwkKey);

				const encryptionData = encoder.encode(message);
				const encryptedMessage = await window.crypto.subtle.encrypt(
					{
						name: 'RSA-OAEP'
					},
					publicKey,
					encryptionData
				);

				// Convert encryptedMessage to base64 and return it as a string
				const encryptedMessageArray = new Uint8Array(encryptedMessage);
				const encryptedMessageString = Array.from(encryptedMessageArray).map(b => String.fromCharCode(b)).join('');
				return btoa(encryptedMessageString);
			},

		askForDecryption: async function askForDecryption(plainTextMessage, encryptedMessage) {
			let responseData;
			try{
				responseData = await DecryptTestRSA(plainTextMessage, encryptedMessage);
			} catch (error) {
				console.error('Error in askForDecryption: ', error);
			}
			if (responseData === plainTextMessage) {
				return responseData;
			} else {
				console.log('problem ');
				console.error('Decryption failed: might be in the formatting/encoding of the message.\nresponse:', responseData);
				return responseData;
			}
		},


		// Method is probably not needed, but kept for reference.
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


