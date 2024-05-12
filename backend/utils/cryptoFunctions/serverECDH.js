const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { JWK } = require('jose');	//to correctly format/encode and transport ECDH key

const serverECDH = {

	serverPubKeyJWK:  fs.readFileSync(path.join(__dirname, '../keys/serverPublicKeyECDH.pem'),'utf8'),
	serverPrivKeyJWK: fs.readFileSync(path.join(__dirname, '../keys/serverPrivateKeyECDH.pem'),'utf8'),
	//pubKey: fs.readFileSync(path.join(__dirname, '/serverPublicKeyECDH.json'), 'utf8'),
	//privKey: 	fs.readFileSync(path.join(__dirname, '/serverPrivateKeyECDH.json'), 'utf8'),
	clientPubKey: null,
	pubKey: null,
	privKey: null,

	initKeys: async function initECDH() {
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
	importclientKey: async function importClientKey(clientKeyString) {
		if (typeof clientKeyString === 'string') {
			this.clientPubKey = await this.keyImportTemplateECDH(JSON.parse(clientKeyString), true);
		} else	{
			this.clientPubKey = await this.keyImportTemplateECDH(clientKeyString, true);
		}
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


	handleEncryptedMessage: async function (encryptedMessage, IvValue, sharedSecretKey) {

		const encryptedMsgArrBuff = this.convertBase64ToArrBuffer(encryptedMessage);

		let IvValueArrBuff = Buffer.from(Object.values(IvValue));
		//
		// TODO: Implement server fetching client public key from DB and deriving shared secret key
		//
		return await this.decryptArrBuffECDH(encryptedMsgArrBuff, IvValueArrBuff, sharedSecretKey);
	},

	deriveSecret: async function deriveSecretKey() {
		// Compute the shared secret using the server's private key and the client's public key
		try {
			return await crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: this.clientPubKey,
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
		}
	},



	decryptArrBuffECDH: async function decryptArrBuffWithSecretECDHKey(encryptedMessage, IvValue, sharedSecretKeyString) {
		let messageBuffer = encryptedMessage instanceof Buffer ? encryptedMessage : Buffer.from(Object.values(encryptedMessage));

		let sharedSecretKey = await crypto.subtle.importKey('jwk', JSON.parse(sharedSecretKeyString), { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: IvValue
			},
			sharedSecretKey,
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

	deriveSharedSecretOld: async function deriveSharedSecret(clientPublicKeyString) {
		let serverSharedSecret;
		let clientPublicKeyJWK
		console.log('serverPrivKeyJWK:', this.serverPrivKeyJWK)
		let JWKserverPrivECDH = JSON.parse(this.serverPrivKeyJWK);

		if (typeof clientPublicKeyString === 'string') {
			clientPublicKeyJWK = JSON.parse(clientPublicKeyString);
		}
		const jwkServer = {
			ext: true,
			kty: JWKserverPrivECDH.kty,
			d: JWKserverPrivECDH.d,
			crv:JWKserverPrivECDH.crv,
			x: JWKserverPrivECDH.x,
			y: JWKserverPrivECDH.y
		};

		clientPublicKeyJWK.key_ops = ['deriveBits'];
		const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', jwkServer, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
		const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, []);
		try {
			serverSharedSecret = await crypto.subtle.deriveKey(
				{
					name: "ECDH",
					public: clientPublicKeyECDH,
				},
				serverPrivateKeyECDH,
				{
					name: "AES-GCM",
					length: 256
				},
				true,
				["encrypt", "decrypt"],
			);
		} catch (error) {
			try {
				const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', JWKserverPrivECDH, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
				const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
				serverSharedSecret = await crypto.subtle.deriveKey(
					{
						name: "ECDH",
						public: clientPublicKeyECDH,
					},
					serverPrivateKeyECDH,
					{
						name: "AES-GCM",
						length: "256"
					},
					true,
					[],
				);
			} catch (error) {
				console.error('2: second attempt failed:', error);
			}
			console.error('1: first attempt failed:', error);
		}
		const exportedServerSharedSecret = await crypto.subtle.exportKey('jwk', serverSharedSecret);
		return JSON.stringify(exportedServerSharedSecret);
	},

};
module.exports = serverECDH;