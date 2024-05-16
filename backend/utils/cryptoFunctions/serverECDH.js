const crypto = require('crypto');
const fs = require('fs');

class ServerECDH {
	constructor() {
		this.clientPubKey = null;
		this.pubKey = null;
		this.privKey = null;
	}

	async loadKeys() {
		this.pubKey = await this.readPubKeyFromFile();
		this.privKey = await this.readPrivKeyFromFile();
	}


	// Dont need this if we are loading keys from file
	// async genKeys() {
	// 	const newServerKeyPairECDH = await crypto.subtle.generateKey(
	// 		{
	// 			name: "ECDH",
	// 			namedCurve: "P-521"
	// 		},
	// 		true,
	// 		["deriveKey", "deriveBits"]
	// 	);
	// 	this.pubKey = newServerKeyPairECDH.publicKey;
	// 	this.privKey = newServerKeyPairECDH.privateKey;
	// }

	async readPubKeyFromFile() {
		const serverPubKeyJWKString = fs.readFileSync('./utils/keys/serverPublicKeyECDH.json', 'utf8');
		return await this.keyImportTemplateECDH(serverPubKeyJWKString, true);
	}

	async readPrivKeyFromFile() {
		const serverPrivKeyJWKString = fs.readFileSync('./utils/keys/serverPrivateKeyECDH.json', 'utf8');
		return await this.keyImportTemplateECDH(serverPrivKeyJWKString, false);
	}


	// We need to use keystore to store the client public key
	// async importClientKey(clientKeyString) {
	// 	this.clientPubKey = await this.keyImportTemplateECDH(clientKeyString, true);
	// 	return this.clientPubKey;
	// }

	async handleEncryptedMessage(encryptedMessage, IvValue, clientPubKey) {
		clientPubKey = await this.keyImportTemplateECDH(clientPubKey, true)
		const sharedSecretKey = await this.deriveSecret(clientPubKey);
		const encryptedMsgArrBuff = this.convertBase64ToArrBuffer(encryptedMessage);

		let IvValueArrBuff = Buffer.from(Object.values(IvValue));
		return await this.decryptArrBuffECDH(encryptedMsgArrBuff, IvValueArrBuff, sharedSecretKey);
	}

	async deriveSecret(clientPubKey) {
		if (!clientPubKey) {
			clientPubKey = this.clientPubKey;
		}
		try {
			return await crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: clientPubKey,
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
			return await crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: clientPubKey,
				},
				this.privKey,
				{
					name: "AES-GCM",
					length: "256"
				},
				true,
				["decrypt"],
			);
		}
	}

	async decryptArrBuffECDH(encryptedMessage, IvValue, sharedSecret) {
		let messageBuffer = encryptedMessage instanceof Buffer ? encryptedMessage : Buffer.from(Object.values(encryptedMessage));

		if (!(sharedSecret instanceof CryptoKey)) {
			if (typeof sharedSecret === 'string') {
				sharedSecret = JSON.parse(sharedSecret);
			}
			sharedSecret = await crypto.subtle.importKey('jwk', JSON.parse(sharedSecret), { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
		}

		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: IvValue
			},
			sharedSecret,
			messageBuffer
		);

		return Buffer.from(this.convertArrBuffToBase64(decrypted),  'base64').toString();
	}

	convertArrBuffToBase64(arrayBuffer) {
		let uint8Array = new Uint8Array(arrayBuffer);
		return Buffer.from(uint8Array).toString('base64');
	}

	convertBase64ToArrBuffer(base64String) {
		let binaryString = Buffer.from(base64String, 'base64').toString('binary');
		let arrayBuffer = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			arrayBuffer[i] = binaryString.charCodeAt(i);
		}
		return arrayBuffer;
	}

	async keyImportTemplateECDH(keyStringJWK,isPublic = true) {
		if(typeof keyStringJWK === 'string') keyStringJWK = JSON.parse(keyStringJWK);
		if (isPublic === true) {
			return await crypto.subtle.importKey(
				'jwk',
				keyStringJWK,
				{
					name: 'ECDH',
					namedCurve: 'P-521',
				},
				true,
				[],
			);
		} else {
			return await crypto.subtle.importKey(
				'jwk',
				keyStringJWK,
				{
					name: 'ECDH',
					namedCurve: 'P-521',
				},
				true,
				["deriveKey", "deriveBits"],
			);
		}
	}

	async exportKeyToString(keyToExport) {
		if (!keyToExport) {
			keyToExport = this.pubKey;
		}
		if (!(keyToExport instanceof CryptoKey)) {
			throw new Error('Invalid key. Key must be a CryptoKey.');
		}
		return JSON.stringify(await crypto.subtle.exportKey('jwk', keyToExport));
	}
}

module.exports = new ServerECDH();