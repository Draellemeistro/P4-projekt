import { fetchKeyECDH } from './apiService.js';
import { tempPostKeyECDH } from './apiServiceDev.js';

// ECDH encryption module
// - initECDH: generates a new ECDH key pair
// - requestServerECDH: requests the server's public ECDH key
// - tempSendEDCHKey: sends the client's public ECDH key to the server
// - deriveSecret: derives the shared secret from the client's private key and the server's public key
// - encryptECDH: encrypts a message with the shared secret
// - verifySharedSecretTest: sends a test message to the server for decryption
// - SendEncryptedMsgTest: sends an encrypted message to the server for decryption
// - keyImportTemplateECDH: imports an ECDH key
// - exportKeyString: exports a key as a string
// - convertArrBuffToBase64: converts an ArrayBuffer to a base64 string

const ECDHCrypto ={

	initECDH: async function initECDH(){
		console.log('initializing ECDH');
		const clientKeyPairECDH = await window.crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
			return { pubKey: clientKeyPairECDH.publicKey, privKey: clientKeyPairECDH.privateKey };

		},



// Function to request server's public key
	requestServerECDH: async function requestServerPublicKeyECDH(){
		const response = await fetchKeyECDH();
		if (!response.ok) {
			console.error('Failed to fetch server public key');
		}
		const data = await response.json();
		const serverPublicKeyECDHString = data.serverPubECDKey;
		const serverPublicKeyParsed = JSON.parse(serverPublicKeyECDHString);
		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that
		const JWKToPassOn = {
			crv: serverPublicKeyParsed.crv,
			ext: serverPublicKeyParsed.ext,
			key_ops: serverPublicKeyParsed.key_ops,
			kty: serverPublicKeyParsed.kty,
			x: serverPublicKeyParsed.x,
			y: serverPublicKeyParsed.y,
		};
		let serverPublicKeyJwk;
		try{
			serverPublicKeyJwk = await this.keyImportTemplateECDH(JWKToPassOn)
		} catch (error) {
			try {
				serverPublicKeyJwk = await this.keyImportTemplateECDH(JWKToPassOn, true)
			} catch (error) {
				console.error('Failed to import FIXED server public key: ', error);
			}
			console.error('Failed to import server public key: ', error);
		}
		return serverPublicKeyJwk;
	},



	tempSendEDCHKey: async function sendECDHKeyToServer(keyToSend) {
		let keyStringPub = keyToSend;
		if (typeof keyStringPub !== 'string') {
			keyStringPub = await  this.exportKeyString(keyToSend);
		}

		const response = await tempPostKeyECDH(keyStringPub);
		if (response.status !== 200) {
			console.error('Failed to send public key: ', response.status);
		}
		if (response.ok) {
			const data = await response.json();
			if (data.success === 1 || data.success === '1') {
				if (data.returnKey === keyStringPub) {
					return 'Success!';
				} else {
					console.error('Failed to send public key: ', data.returnKey);
					console.error('Failed to send public key: ', keyStringPub);
					return 'failed: incorrect key';
				}
			} else {
				return 'failed: no value';
			}
		} else {
			console.error('Failed to send public key');
			return 'failed: fetch error';
		}
	},



// Function to compute shared secret
	deriveSecret: async function deriveSecretKey(clientPrivateKey, serverPubKey) {
		/////////////
		//	SOMEHOW DOESN'T WORK WITH CHROME, BUT FIREFOX WORKS???????
		// 	FUCK THIS SHIT.
		//////////////
		let serverKeyForSecret = serverPubKey;
		let clientKeyForSecret = clientPrivateKey;

		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that


		if (typeof serverKeyForSecret === 'string') {
			serverKeyForSecret = await this.keyImportTemplateECDH(JSON.parse(serverPubKey));
		}
		if(typeof clientKeyForSecret === 'string') {
			let clientKeyForSecretParsed = JSON.parse(clientPrivateKey);
			let jwkClient = {
				ext: true,
				kty: clientKeyForSecretParsed.kty,
				d: clientKeyForSecretParsed.d,
				crv:clientKeyForSecretParsed.crv,
				x: clientKeyForSecretParsed.x,
				y: clientKeyForSecretParsed.y
			};
			clientKeyForSecret = await this.keyImportTemplateECDH(jwkClient);
		}
		try {
			return await window.crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: serverKeyForSecret,
				},
				clientKeyForSecret,
				{
					name: "AES-GCM",
					length: "256"
				},
				true,
				["encrypt", "decrypt"],
			);
		} catch (error) {
			console.error('1: initial attempt failed. Try again with no key_ops, or use derive bits: ', error);
		}
	},





	encryptECDH: async function encryptMessageECDH(message, sharedSecret) {
		const encoder = new TextEncoder();// Check if the message and publicKey are valid
		if (typeof message !== 'string' || message.length === 0) {
			console.error('Invalid message. Please provide a non-empty string.');
			return false;
		}
		const ivValue = window.crypto.getRandomValues(new Uint8Array(12)); //needed for decryption
		const encryptedMessage = await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv: ivValue,
			},
			sharedSecret,
			encoder.encode(message)
		);
		return {
			encryptedMessage: this.convertArrBuffToBase64(encryptedMessage),
			ivValue: ivValue
		};
	},

	keyImportTemplateECDH: async function keyImportTemplateECDH(keyString,optionalParams = false	) {
		if (optionalParams === true) {
			return await window.crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'ECDH',
					namedCurve: 'P-521',
				},
				true,
				[],
			);
		} else {
			return await window.crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'ECDH',
					namedCurve: 'P-521',
				},
				true,
				["deriveKey", "deriveBits"],
			);
		}
	},

	exportKeyString: async function exportKeyString(keyToExport) {
		// to send the key, it must be converted to a string. This function does that. CryptoKey -> JWK -> string
		return JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyToExport))
	},


	convertArrBuffToBase64: function convertArrayBufferToBase64(arrayBuffer) {
		// Convert an encrypted to base64 and return it as a string. allows for easy transmission and avoids odd encoding issues
		let uint8Array = new Uint8Array(arrayBuffer);
		return btoa(String.fromCharCode.apply(null, uint8Array));
	},

};
export default ECDHCrypto;
