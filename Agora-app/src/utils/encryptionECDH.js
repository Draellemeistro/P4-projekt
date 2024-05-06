import { fetchKeyECDH } from './apiService.js';
import { checkSharedSecretTest, messageDecryptTestECDH } from './apiServiceDev.js';
import { tempPostKeyECDH } from './apiServiceDev.js';


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
		const exportedPubKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.publicKey);
		const fixedPubKey = this.fixAndValidateJWK(exportedPubKeyECDH);
		const exportedPrivKeyECDH = await window.crypto.subtle.exportKey('jwk', clientKeyPairECDH.privateKey);


		// Convert the keys to strings
		const keyStringPriv = JSON.stringify(exportedPrivKeyECDH);
		const keyStringPub = JSON.stringify(fixedPubKey);
		sessionStorage.setItem('clientPublicKeyECDH', keyStringPub);
		//probably not secure to store private key in session storage
		sessionStorage.setItem('clientPrivateKeyECDH', keyStringPriv);
		console.log('returning keys')
		return { keyStringPub: keyStringPub, keyStringPriv: keyStringPriv};
	},



// Function to send client's public key and receive server's public key
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
		let keyTestExport = await window.crypto.subtle.exportKey('jwk',serverPublicKeyJwk)
		keyTestExport = this.fixAndValidateJWK(keyTestExport)
		//TODO: remove line below
		const keyString = JSON.stringify(keyTestExport); //probably redundant, but just to be sure
		sessionStorage.setItem('serverPublicKeyECDH', keyString);
		return keyString;
	},



	tempSendEDCHKey: async function sendECDHKeyToServer(keyStringPubToUse) {
		const response = await tempPostKeyECDH(keyStringPubToUse);
		if (response.status !== 200) {
			console.error('Failed to send public key: ', response.status);
		}
		if (response.ok) {
			const data = await response.json();
			if (data.success === 1 || data.success === '1') {
				if (data.returnKey === keyStringPubToUse) {
					return 'Success!';
				} else {
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
	deriveSecret: async function deriveSecretKey(clientPrivateKeyString, serverPubKeyString) {
		/////////////
		//	SOMEHOW DOESN'T WORK WITH CHROME, BUT FIREFOX WORKS???????
		// 	FUCK THIS SHIT.
		//////////////
		let serverKeyForSecret;
		let clientKeyForSecret;

		if (this.compareKeyWithStorage(serverPubKeyString) !== 'server') {
			serverKeyForSecret = sessionStorage.getItem('serverPublicKeyECDH');
		} else {
			serverKeyForSecret = JSON.parse(serverPubKeyString);
		}
		if(typeof clientPrivateKeyString === 'string') {
			clientKeyForSecret = JSON.parse(clientPrivateKeyString);
		} else {
			console.error('clientPrivateKey is not a string. Trying to use it anyway');
			clientKeyForSecret = clientPrivateKeyString;
		}

		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that
		const jwkClient = {
			ext: true,
			kty: clientKeyForSecret.kty,
			d: clientKeyForSecret.d,
			crv:clientKeyForSecret.crv,
			x: clientKeyForSecret.x,
			y: clientKeyForSecret.y
		};
		const clientKeyForSecretJWK = await this.keyImportTemplateECDH(jwkClient);
		const serverKeyForSecretJWK =  await this.keyImportTemplateECDH(serverKeyForSecret);
		clientKeyForSecret = clientKeyForSecretJWK;
		serverKeyForSecret = serverKeyForSecretJWK;
		let sharedSecretKey;
		try {
			sharedSecretKey = await window.crypto.subtle.deriveKey(
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
		const exportedSharedSecretKey = await window.crypto.subtle.exportKey('jwk', sharedSecretKey);
		const sharedSecretString = JSON.stringify(exportedSharedSecretKey);
		sessionStorage.setItem('sharedSecretECDH', sharedSecretString); // TODO: non-secure, should be removed
		return sharedSecretString;
	},





	encryptECDH: async function encryptMessageECDH(message, sharedSecret) {
		const encoder = new TextEncoder();
		let SharedSecretForEncryption;
		// Check if the message and publicKey are valid
		if (typeof message !== 'string' || message.length === 0) {
			console.error('Invalid message. Please provide a non-empty string.');
			return false;
		}
		if (typeof sharedSecret !== 'string' || sharedSecret.length === 0) {
			console.error('Invalid sharedSecret. Attempting to re-derive shared secret from sessionStorage.');
			const keyString = sessionStorage.getItem('sharedSecretECDH'); //TODO: non-secure, should be removed
			if (!keyString) {
				console.error('No shared secret provided or stored. Please provide a valid shared secret');
				return false;
			} else {
				console.log('using shared secret from session storage for encryption.');
				const jwkKey = JSON.parse(keyString);
				SharedSecretForEncryption = await window.crypto.subtle.importKey(
					'jwk',
					jwkKey,
					{
						name: 'AES-GCM',
						length: 256
					},
					true,
					['encrypt', 'decrypt']
				);
			}
		} else {
			const JwKSharedSecret = JSON.parse(sharedSecret);
			SharedSecretForEncryption = await window.crypto.subtle.importKey(
				'jwk',
				JwKSharedSecret,
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['encrypt', 'decrypt']
			);
		}
		const ivValue = window.crypto.getRandomValues(new Uint8Array(12)); //needed for decryption
		const encryptedMessage = await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv: ivValue,
			},
			SharedSecretForEncryption,
			encoder.encode(message)
		);
		return {
			encryptedMessage: this.convertArrBuffToBase64(encryptedMessage),
			ivValue: ivValue
		};
	},



	verifySharedSecretTest: async function verifyTestSharedSecret(keyStringSharedSecret, keyStringPub) {
		const response = await checkSharedSecretTest(keyStringSharedSecret, keyStringPub);
		if (response.status !== 200) {
			console.error('Failed to send shared secret');
		} if (response.ok) {
			const data = await response.json();
			if (data.success === true || data.success === 'true') {
				return 'success!';
			} else if (data.success === false || data.success === 'false') {
				return 'failed';
			} else {
				return 'error';
			}
		}
	},



	SendEncryptedMsgTest: async function serverDecryptionTest(plainTextMessage, encryptedMessage, clientPublicKey, ivValue) {
		console.log('encryptedMessage: ', encryptedMessage);
		let msgForServer = JSON.stringify({
			plainTextMessage: plainTextMessage,
			encryptedMessage: encryptedMessage,
			clientPublicKey: clientPublicKey,
			IvValue: ivValue
		});
		const response = await messageDecryptTestECDH(msgForServer);
		if (response.ok) {
			const data = await response.json();
			if (JSON.stringify(plainTextMessage) === JSON.stringify(data.decryptedMessage)) {
				return ('Decryption successful! Received decryption: ' +  JSON.stringify(data.decryptedMessage));
			} else if (data.decryptedMessage === plainTextMessage) {
				return ('2 Decryption successful! Received decryption: ' + data.decryptedMessage);
			} else {
				return ('Decryption failed. Received: ' + data.decryptedMessage);
			}
		} else {
			console.error('Failed to fetch', response);
			return 'error: failed to fetch';
		}
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



	compareKeyWithStorage: function(key) {
		const keyStringImported = key;
		const serverPubKeySessionStorage = sessionStorage.getItem('serverPublicKeyECDH');
		const clientKeyStringSessionStorage = sessionStorage.getItem('clientPublicKeyECDH')
		if (!keyStringImported) {
			//console.error('invalid Key passed to function');
			return 'invalid';
		} else {
			if (keyStringImported === clientKeyStringSessionStorage) {
				return 'client';
			} else if (keyStringImported === serverPubKeySessionStorage) {
				return 'server';
			} else {
				return 'neither';
			}
		}
	},



	fixAndValidateJWK: function insertKeyOpsAndValidate(jwkToValidate, isPrivateKey = false) {
		//TODO clean this function up. It's a mess, but without it, the keys don't work.
		let jwk;
		if (typeof jwkToValidate === 'string') {
			jwk = JSON.parse(jwkToValidate);
			if (!jwk.key_ops) {
				jwk.key_ops = [];
			}
			if (!jwk.key_ops.includes('deriveKey')) {
				jwk.key_ops.push('deriveKey');
			}
			if (!jwk.key_ops.includes('deriveBits')) {
				jwk.key_ops.push('deriveBits');
			}
			if (!jwk.ext) {
				jwk.ext = true;
			}
			if (isPrivateKey === true) {
				const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];
				const isValid = validProperties.every(prop => prop in jwk);
				if (!isValid) {
					throw new Error('Invalid JWK format');
				}
			} else {
				const validProperties = ['crv',"d", 'ext', 'key_ops', 'kty', 'x', 'y'];
				const isValid = validProperties.every(prop => prop in jwk);
				if (!isValid) {
					throw new Error('Invalid JWK format');
				}
			}


			return jwk;
		}

		jwk = jwkToValidate;
		// Insert key_ops into the JWK
		if (!jwk.key_ops) {
			jwk.key_ops = [];
		}

		// Add "deriveKey" and "deriveBits" to key_ops if they're not already present
		if (!jwk.key_ops.includes("deriveKey")) {
			jwk.key_ops.push("deriveKey");
		}
		if (!jwk.key_ops.includes("deriveBits")) {
			jwk.key_ops.push("deriveBits");
		}
		if (!jwk.ext) {
			jwk.ext = true;
		}
		// Define the properties that a valid JWK should have
		const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];

		// Check if the JWK has all the valid properties
		const isValid = validProperties.every(prop => prop in jwk);

		if (!isValid) {
			throw new Error('Invalid JWK format');
		}

		return jwk;
	},



	convertArrBuffToBase64: function convertArrayBufferToBase64(arrayBuffer) {
		let uint8Array = new Uint8Array(arrayBuffer);
		return btoa(String.fromCharCode.apply(null, uint8Array));
	},


//	agreeSharedSecret_NOTIMPLEMENTED: async function agreeSharedSecretKey() {
//		//TODO: implement this function
//		return console.log('shared secret key agreed... when this function is implemented');
//	},
};
export default ECDHCrypto;

//convertBase64ToArrayBuffer: function convertBase64ToArrayBuffer(base64String) {
//	const binaryString = window.atob(base64String);
//	const bytes = new Uint8Array(binaryString.length);
//	for (let i = 0; i < binaryString.length; i++) {
//		bytes[i] = binaryString.charCodeAt(i);
//	}
//	return bytes.buffer;
//},
