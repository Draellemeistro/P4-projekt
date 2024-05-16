const crypto = require('crypto');
const fs = require('fs');
const { importTemplateECDH, base64ToArrayBuffer, arrayBufferToBase64 } = require('./utilsCrypto');
//const { keyStore } = require('../clientPublicKeyStore');

class ServerECDH {
	constructor() {
		this.pubKey = null;
		this.privKey = null;
		this.loadKeys().then(r => {
			console.log(r);
		});
	}

	async loadKeys() {
		this.pubKey = await this.readPubKeyFromFile();
		this.privKey = await this.readPrivKeyFromFile();
		return 'ECDH keys loaded';
	}

	async readPubKeyFromFile() {
		const serverPubKeyJWKString = fs.readFileSync('./utils/keys/serverPublicKeyECDH.json', 'utf8');
		return await this.importECDH(serverPubKeyJWKString, true);
	}

	async readPrivKeyFromFile() {
		const serverPrivKeyJWKString = fs.readFileSync('./utils/keys/serverPrivateKeyECDH.json', 'utf8');
		return await this.importECDH(serverPrivKeyJWKString, false);
	}

	async handleEncryptedMessage(encryptedMessage, IvValue, clientPubKey) {
				clientPubKey = await this.importECDH(clientPubKey, true)
		const sharedSecretKey = await this.deriveSecret(clientPubKey);
		const encryptedMsgArrBuff = base64ToArrayBuffer(encryptedMessage);
		let IvValueArrBuff = Buffer.from(Object.values(IvValue));
		return await this.decryptArrBuffECDH(encryptedMsgArrBuff, IvValueArrBuff, sharedSecretKey);
	}

	async deriveSecret(clientPubKey) {
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
			sharedSecret = await crypto.subtle.importKey('jwk', sharedSecret, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
		}

		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: IvValue
			},
			sharedSecret,
			messageBuffer
		);

		return Buffer.from(arrayBufferToBase64(decrypted),  'base64').toString();
	}

	async importECDH(keyString, isPublic = true) {
		return await importTemplateECDH(keyString, isPublic);
	}
	getPubKey() {
		return this.pubKey;
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