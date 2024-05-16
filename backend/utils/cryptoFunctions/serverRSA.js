const crypto = require('crypto');
const fs = require('fs');
const { importTemplateRSA, base64ToArrayBuffer } = require('./utilsCrypto');

class ServerRSA {
	constructor() {
		this.pubKey = null;
		this.privKey = null;
	}

	async loadKeys() {
		this.pubKey = await this.readPubKeyFromFile();
		this.privKey = await this.readPrivKeyFromFile();
	}

	async genKeys() {
		const keys = await crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: {name: "SHA-256"}
			},
			true,
			["encrypt", "decrypt"]
		);
		this.pubKey = keys.publicKey;
		this.privKey = keys.privateKey;
	}

	async readPubKeyFromFile() {
		const serverPubKeyString = fs.readFileSync('./utils/keys/serverPublicKeyRSA.json', 'utf8');
		return await this.importRSA(serverPubKeyString, true);
	}

	async readPrivKeyFromFile() {
		const serverPrivKeyString = fs.readFileSync('./utils/keys/serverPrivateKeyRSA.json', 'utf8');
		return await this.importRSA(serverPrivKeyString, false);
	}

	async decryptMessage(encryptedMessage) {
		if(typeof encryptedMessage === 'string') encryptedMessage = base64ToArrayBuffer(encryptedMessage);
		const bufferFromBase64 = Buffer.from(encryptedMessage);
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'RSA-OAEP'
			},
			this.privKey,
			bufferFromBase64
		)
		return Buffer.from(decrypted).toString();
	}

	async encryptMessage(message) {
		const data =  Buffer.from(message);
		return await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			this.pubKey,
			data
		)
	}

	async importRSA(keyString, isPublic = true) {
		return await importTemplateRSA(keyString, isPublic);
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

module.exports = new ServerRSA();