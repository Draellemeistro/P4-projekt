//import { fetchKeyECDH } from './apiService.js';

const ECDH ={
	// ECDH.pubKey
	serverPubKey: null,
	serverPubKeyVariant: null,
	pubKey: null,
	privKey: null,

//TODO MAKE SURE SERVERKEYSTRING IS NOT NULL
	saveServerKeyVariant: async function saveServerKey(keyString) {
		let keyToImportTwo;
		keyToImportTwo = await this.convertStringToJWK(keyString, true);
		const serverKey = await this.importKeyProperly(keyToImportTwo);
		this.serverPubKeyVariant = await serverKey;
		return serverKey;
	},
	saveServerKey: async function saveServerKey(keyString) {
		let keyToImportTwo;
		keyToImportTwo = JSON.parse(keyString);
		const serverKey = await this.importKeyProperly(keyToImportTwo);
		this.serverPubKey = await serverKey;
		return serverKey;
	},
	importKeyProperly: async function importKeyProperly(keyToImport) {
		let serverPublicKey;
		try{
			serverPublicKey = await this.keyImportTemplateECDH(keyToImport, true)
		} catch (error) {
			console.error('Failed to import key without usages: ', error);
			try {
				serverPublicKey = await this.keyImportTemplateECDH(keyToImport)
			} catch (error) {
				console.error('key has to be imported without key usages. trying now: ');
			}
		}
		return serverPublicKey;
	},
	//TODO MAKE SURE INITIALIZATION IS DONE
	initECDH: async function initECDH(){
		const clientKeyPairECDH = await window.crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		this.pubKey = clientKeyPairECDH.publicKey;
		this.privKey = clientKeyPairECDH.privateKey;
		return {pubKey: this.pubKey, privKey: this.privKey};
	},

	deriveSecret: async function deriveSecretKey() {
	// Compute the shared secret using the client's private key and the server's public key
		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that
		try {
			return await window.crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: this.serverPubKey,
				},
				this.privKey,
				{
					name: "AES-GCM",
					length: "256"
				},
				true,
				["encrypt", "decrypt"],
			);
		} catch (error) {
			console.error('Failed to derive secret key: ', error);
			console.error('keys should be of type: CryptoKey. clientPrivKey: ', typeof this.privKey, ' serverPubKey: ', typeof this.serverPubKey);
		}
	},
	encrypt: async function encryptMessageECDH(message, sharedSecret) {
		const encoder = new TextEncoder();// Check if the message and publicKey are valid
		if (typeof message !== 'string' || message.length === 0) {
			throw new Error('Invalid message. Please provide a non-empty string.');
		}

		if (!sharedSecret) {
			sharedSecret = await this.deriveSecret();
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

	keyImportTemplateECDH: async function keyImportTemplateECDH(keyString,isPublic = true	) {
		if (isPublic === true) {
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

	exportKeyToString: async function (keyToExport) {
		if (!keyToExport) {
			keyToExport = this.pubKey;
		}
		if (!(keyToExport instanceof CryptoKey)) {
			throw new Error('Invalid key. Key must be a CryptoKey.');
		}
		return JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyToExport));
		// to send the key, it must be converted to a string. This function does that. CryptoKey -> JWK -> string
	},


	convertArrBuffToBase64: function convertArrayBufferToBase64(arrayBuffer) {
		// Convert an encrypted to base64 and return it as a string. allows for easy transmission and avoids odd encoding issues
		let uint8Array = new Uint8Array(arrayBuffer);
		return btoa(String.fromCharCode.apply(null, uint8Array));
	},

	//ss
	convertStringToJWK: async function convertStringToJWK(keyString, KeyOps = true) {
		if(typeof keyString !== 'string'){
			throw new Error('Key must be a string.');
		}
		const keyParsed = JSON.parse(keyString);
		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that
		let JWKToPassOn;
		if (KeyOps === true) {
			JWKToPassOn = {
				crv: keyParsed.crv,
				ext: keyParsed.ext,
				key_ops: keyParsed.key_ops,
				kty: keyParsed.kty,
				x: keyParsed.x,
				y: keyParsed.y,
			};
		}
		else {
			JWKToPassOn = {
				crv: keyParsed.crv,
				ext: keyParsed.ext,
				key_ops: [],
				kty: keyParsed.kty,
				x: keyParsed.x,
				y: keyParsed.y,
			};
		}
		console.log('JWKToPassOn:', JWKToPassOn);
		return JWKToPassOn;

	},
	ECDHPart: async function ECDHpart(message) {
		let sharedSecret;
		sharedSecret = await this.deriveSecret();
		return await this.encrypt(message, sharedSecret);
	},


	reset() {
		this.serverPubKey = null;
		this.serverPubKeyVariant = null;
		this.pubKey = null;
		this.privKey = null;
	}
};
export default ECDH;