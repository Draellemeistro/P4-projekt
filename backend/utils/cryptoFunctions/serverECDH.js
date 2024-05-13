const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const serverECDH = {

	serverPubKeyJWK:  fs.readFileSync(path.join(__dirname, '../keys/serverPublicKeyECDH.pem'),'utf8'),
	serverPrivKeyJWK: fs.readFileSync(path.join(__dirname, '../keys/serverPrivateKeyECDH.pem'),'utf8'),
	//pubKey: fs.readFileSync(path.join(__dirname, '/serverPublicKeyECDH.json'), 'utf8'),
	//privKey: 	fs.readFileSync(path.join(__dirname, '/serverPrivateKeyECDH.json'), 'utf8'),
	clientPubKey: null,
	pubKey: null,
	privKey: null,

	genKeys: async function initECDH() {
		let keyStringObject;
		const newServerKeyPairECDH = await crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		this.pubKey = newServerKeyPairECDH.publicKey;
		this.privKey = newServerKeyPairECDH.privateKey;
	},

	readKeysFromFiles: function importKeys() {
		const serverPubKeyJWKString = fs.readFileSync(path.join(__dirname, '../keys/serverPublicKeyECDH.json'),'utf8');
		const serverPrivKeyJWKString = fs.readFileSync(path.join(__dirname, '../keys/serverPrivateKeyECDH.json'),'utf8');
		const serverPubKeyJWK = JSON.parse(serverPubKeyJWKString);
		const serverPrivKeyJWK = JSON.parse(serverPrivKeyJWKString);
		this.pubKey = this.keyImportTemplateECDH(serverPubKeyJWK, true);
		this.privKey = this.keyImportTemplateECDH(serverPrivKeyJWK);
	},
	importClientKey: async function importClientKey(clientKeyString) {
		this.clientPubKey = await this.keyImportTemplateECDH(clientKeyString, true);
		return this.clientPubKey;
	},

	keyImportTemplateECDH: async function keyImportTemplateECDH(keyStringJWK,isPublic = true	) {
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


	handleEncryptedMessage: async function (encryptedMessage, IvValue, clientPubKey) {
		if(!(clientPubKey instanceof CryptoKey)) {
			clientPubKey = await this.keyImportTemplateECDH(clientPubKey, true);
		}
		const sharedSecretKey = await this.deriveSecret(clientPubKey);
		const encryptedMsgArrBuff = this.convertBase64ToArrBuffer(encryptedMessage);

		let IvValueArrBuff = Buffer.from(Object.values(IvValue));
		//
		// TODO: Implement server fetching client public key from DB and deriving shared secret key
		//
		return await this.decryptArrBuffECDH(encryptedMsgArrBuff, IvValueArrBuff, sharedSecretKey);
	},

	deriveSecret: async function deriveSecretKey(clientPubKey) {
		// Compute the shared secret using the server's private key and the client's public key
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
	},



	decryptArrBuffECDH: async function decryptArrBuffWithSecretECDHKey(encryptedMessage, IvValue, sharedSecret) {
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
	},

	convertArrBuffToBase64: function convertArrayBufferToBase64(arrayBuffer) {
		let uint8Array = new Uint8Array(arrayBuffer);
		return Buffer.from(uint8Array).toString('base64');
	},
	convertBase64ToArrBuffer: function convertBase64ToArrayBuffer(base64String) {
		console.log('base64String:', base64String);
		let binaryString = Buffer.from(base64String, 'base64').toString('binary');
		let arrayBuffer = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			arrayBuffer[i] = binaryString.charCodeAt(i);
		}
		return arrayBuffer;
	},

};
module.exports = serverECDH;