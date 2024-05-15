const crypto = require('crypto');
const fs = require('fs');
const { join } = require('path');



const serverRSA = {

	pubKey: null,
	privKey: null,

	readPubKeyFromFile: async () => {
		const serverPubKeyString = fs.readFileSync(join(__dirname, '/serverPublicKeyECDH.json'), 'utf8');
		return await serverRSA.keyImportTemplateRSA(serverPubKeyString, true);
	},

	readPrivKeyFromFile: async () => {
		const serverPrivKeyString = fs.readFileSync(path.join(__dirname, '/serverPrivateKeyECDH.json'), 'utf8');
		return await serverRSA.keyImportTemplateRSA(serverPrivKeyString, false);
	},

	loadKeys: async () => {
		serverRSA.pubKey = await serverRSA.readPubKeyFromFile();
		serverRSA.privKey = await serverRSA.readPrivKeyFromFile();
	},
	//pubKeyString:  fs.readFileSync('./utils/keys/serverPublicKeyRSA.pem','utf8'),
	//privKeyString: fs.readFileSync('./utils/keys/serverPrivateKeyRSA.pem','utf8'),



	genKeys: async function generateKeys() {
		let keys =  await crypto.subtle.generateKey(
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

	},

	saveKeysToFile: async function saveKeysToFile(){
		const pubKeyString = await this.exportKeyToString(this.pubKey);
		const privKeyString = await this.exportKeyToString(this.privKey);
		fs.writeFileSync('./utils/keys/RSAPubKey.json', pubKeyString);
		fs.writeFileSync('./utils/keys/RSAPrivKey.json', privKeyString);
	},
	decryptRSA: async function decryptMessage(encryptedMessage) {
		if(typeof encryptedMessage === 'string') encryptedMessage = this.base64ToArrBuff(encryptedMessage);
		const bufferFromBase64 = Buffer.from(encryptedMessage);
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'RSA-OAEP'
			},
			this.privKey,
			bufferFromBase64
		) /// this may need to be changed to a buffer, use the ArrayBuffer to 64 conversion or likewise
		return this.ArrBuffToString(decrypted);
	},
	encryptRSA: async function encryptMessage(message) {
		const data =  Buffer.from(message);
		return await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			this.pubKey,
			data
		)
	},
	readKeysFromFiles: async function importKeys() {
		const serverPubKeyString = fs.readFileSync('./utils/keys/RSAPubKey.json', 'utf8');
		const serverPrivKeyString = fs.readFileSync('./utils/keys/RSAPrivKey.json', 'utf8');
		this.pubKey = await this.keyImportTemplateRSA(serverPubKeyString, true);
		this.privKey = await this.keyImportTemplateRSA(serverPrivKeyString, false);
	},



	keyImportTemplateRSA: async function keyImportTemplateRSA(keyString, isPublic = true) {
		if (typeof keyString === 'string') keyString = JSON.parse(keyString);
		if (isPublic) {
			return await crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'RSA-OAEP',
					hash: { name: 'SHA-256' }
				},
				true,
				['encrypt']
			);
		} else {
			return await crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'RSA-OAEP',
					hash: { name: 'SHA-256' }
				},
				true,
				['decrypt']
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
		return JSON.stringify(await crypto.subtle.exportKey('jwk', keyToExport));
		// to send the key, it must be converted to a string. This function does that. CryptoKey -> JWK -> string
	},

	ArrBuffToString: function convertArrayBufferToBase64(message) {
		return Buffer.from(message).toString();
		//return Buffer.from(arrayBuffer).toString('base64');
	},
	ArrBuffToBase64: function arrayBufferToBase64(buffer) {
	return Buffer.from(buffer).toString('base64');
	},
	base64ToArrBuff: function base64ToArrayBuffer(base64) {
	return Buffer.from(base64, 'base64');
	},

};
module.exports = serverRSA;

