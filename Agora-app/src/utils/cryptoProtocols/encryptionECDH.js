//import { fetchKeyECDH } from './apiService.js';

const ECDH ={
	// ECDH.pubKey

	serverKey: null,
	serverPubKeyVariant: null,
	pubKey: null,
	privKey: null,


	saveServerKey: async function saveServerKey(keyString) {
		const serverKey = await this.keyImportTemplateECDH(keyString, true)
		this.serverKey = await serverKey;
		return serverKey;
	},

	//TODO MAKE SURE INITIALIZATION IS DONE
	genKeys: async function initECDH(){
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
					public: this.serverKey,
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
			console.error('keys should be of type: CryptoKey. clientPrivKey: ', typeof this.privKey, ' serverKey: ', typeof this.serverKey);
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
			ivValue: ivValue,
		};
	},

	keyImportTemplateECDH: async function keyImportTemplateECDH(keyString,isPublic = true	) {
		if (typeof keyString === 'string') keyString = JSON.parse(keyString);
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
};
export default ECDH;