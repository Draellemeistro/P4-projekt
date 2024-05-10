//import { fetchKeyECDH } from './apiService.js';

const ECDH ={
	// ECDH.pubKey
	serverPubKey: null,
	pubKey: null,
	privKey: null,

//TODO MAKE SURE SERVERKEYSTRING IS NOT NULL
	saveServerKey: async function saveServerKey(keyString) {
		if (typeof keyString === 'string') {
			keyString = this.convertStringToJWK(keyString);
		}
		this.serverPubKey = await this.keyImportTemplateECDH(keyString);
	},
	//TODO MAKE SURE INITIALIZATION IS DONE
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
		this.pubKey = clientKeyPairECDH.publicKey;
		this.privKey = clientKeyPairECDH.privateKey;
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
		if (typeof keyToExport === "undefined") {
			return  JSON.stringify(await window.crypto.subtle.exportKey('jwk', this.pubKey));
		} else {
			return JSON.stringify(await window.crypto.subtle.exportKey('jwk', keyToExport));
		}
		// to send the key, it must be converted to a string. This function does that. CryptoKey -> JWK -> string
	},


	convertArrBuffToBase64: function convertArrayBufferToBase64(arrayBuffer) {
		// Convert an encrypted to base64 and return it as a string. allows for easy transmission and avoids odd encoding issues
		let uint8Array = new Uint8Array(arrayBuffer);
		return btoa(String.fromCharCode.apply(null, uint8Array));
	},

	//ss
	convertStringToJWK: async function convertStringToJWK(keyString) {
		const keyParsed = JSON.parse(keyString);
		//because of some weird bug, the key_ops and ext properties are not passed on correctly
		//this is a workaround to fix that
		const JWKToPassOn = {
			crv: keyParsed.crv,
			ext: keyParsed.ext,
			key_ops: keyParsed.key_ops,
			kty: keyParsed.kty,
			x: keyParsed.x,
			y: keyParsed.y,
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
	ECDHPart: async function ECDHpart(message) {
		let sharedSecret;
		sharedSecret = await this.deriveSecret(this.privKey, this.serverPubKey);
		return await this.encryptECDH(message, sharedSecret);
	},

};
export default ECDH;