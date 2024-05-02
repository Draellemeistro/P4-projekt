const crypto = require('crypto');
const fs = require('fs');

const serverECDHCrypto = {
	initECDH: async function initECDH(){
		let keyStringObject;
		const newServerKeyPairECDH = await crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		const exportedPubKeyECDH = await crypto.subtle.exportKey('jwk', newServerKeyPairECDH.publicKey);
		console.log('client public key as JWK: ', exportedPubKeyECDH);
		const exportedPrivKeyECDH = await crypto.subtle.exportKey('jwk', newServerKeyPairECDH.privateKey);
		// Convert the keys to strings
		const publicKeyString = JSON.stringify(exportedPubKeyECDH);
		const privateKeyString = JSON.stringify(exportedPrivKeyECDH);
		fs.writeFileSync('serverPublicKeyECDH.json', publicKeyString);
		fs.writeFileSync('serverPrivateKeyECDH.json', privateKeyString);
		return {publicKeyString, privateKeyString};
	},
	deriveSecret: async function(serverECDH, clientPublicKey) {
		return '1';
	},
	encryptECDH: async function(plainText, sharedSecretKey) {
		return '1';
	},
	decryptECDH: async function(encryptedText, sharedSecretKey) {
		return '1';
	},
	ECDHCryptoTest: function testImportAndEncryption(serverPrivateKey, clientPublicKey) {
		const plainMessage = 'Hello, World!';
		const sharedSecretKey = serverECDHCrypto.deriveSecret(serverPrivateKey, clientPublicKey);
		const encrypted = serverECDHCrypto.encryptECDH(plainMessage, sharedSecretKey);
		const decrypted = serverECDHCrypto.decryptECDH(encrypted, sharedSecretKey);
		if (decrypted === plainMessage) {
			console.log('ECDH encryption and decryption:\nSuccess:', decrypted === plainMessage);
			return true;
		} else {
			console.log('Failure:', decrypted !== plainMessage);
			console.log('Decrypted:', decrypted);
			console.log('plaintext:', plainMessage);
			return false;
		}
	},
	fixAndValidateJWK: function insertKeyOpsAndValidate(jwkToValidate) {
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
			if (jwk.d === undefined) {
				const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];
				const isValid = validProperties.every(prop => prop in jwk);
				if (!isValid) {
					throw new Error('Invalid JWK format');
				}
			} else {
				console.log('JWK is most likely private, dL: ', jwk.d);
			}
			return jwk;
		} else {
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
			if (jwk.d === undefined) {
				const validProperties = ['crv', 'ext', 'key_ops', 'kty', 'x', 'y'];
				const isValid = validProperties.every(prop => prop in jwk);
				if (!isValid) {
					throw new Error('Invalid JWK format');
				}
			} else {
				console.log('JWK is most likely private, dL: ', jwk.d);
			}

			return jwk;
		}
		},
	convertBase64ToArrBuffer: function convertBase64ToArrayBuffer(base64String) {
		let binaryString = Buffer.from(base64String, 'base64').toString('binary');
		let arrayBuffer = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			arrayBuffer[i] = binaryString.charCodeAt(i);
		} return arrayBuffer;
	},
	decryptArrBuffECDH: async function decryptArrBuffWithSecretECDHKey(encryptedMessage, IvValue, sharedSecretKeyString) {
		const buffer = encryptedMessage instanceof Buffer ? encryptedMessage : Buffer.from(encryptedMessage, 'base64');
		let sharedSecretKey = JSON.parse(sharedSecretKeyString);
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv: IvValue
			},
			sharedSecretKey,
			buffer
		);
		return decrypted.toString();
	},
	handleEncryptedMessage: async function handleEncryptedMessage(encryptedMessage, IvValue, sharedSecretKey) {
		const encryptedMsgArrBuff = this.convertBase64ToArrBuffer(encryptedMessage);
		//
		// TODO: Implement server fetching client public key from DB and deriving shared secret key
		//
		return await serverECDHCrypto.decryptArrBuffECDH(encryptedMsgArrBuff, IvValue, sharedSecretKey);
	},
	deriveSharedSecret:
		async function deriveSharedSecret(serverPrivateKeyString, clientPublicKeyString) {
			let responseValue;
			let serverSharedSecret;

			// Parse the keys from JSON strings back into objects
			let clientPublicKeyJWK = JSON.parse(clientPublicKeyString);
			let JWKserverPrivECDH = JSON.parse(serverPrivateKeyString);

			const jwkServer = {
				ext: true,
				kty: JWKserverPrivECDH.kty,
				d: JWKserverPrivECDH.d,
				crv:JWKserverPrivECDH.crv,
				x: JWKserverPrivECDH.x,
				y: JWKserverPrivECDH.y
			};
			clientPublicKeyJWK.key_ops = ['deriveBits'];
			console.log('Client public key:', clientPublicKeyJWK);
			const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', jwkServer, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
			const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, []);
			try {
				console.log('attempting to derive key: 1');

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
				console.log('Trying again with no key_ops: 2');
				try {
					const serverPrivateKeyECDH = await crypto.subtle.importKey('jwk', JWKserverPrivECDH, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
					const clientPublicKeyECDH = await crypto.subtle.importKey('jwk', clientPublicKeyJWK, { name: 'ECDH', namedCurve: 'P-521' }, true, ['deriveKey', 'deriveBits']);
					serverSharedSecret = await window.crypto.subtle.deriveKey(
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
					console.error('2: third attempt failed:', error);
				}
				console.error('1: second attempt failed:', error);
			}

			console.log('Server shared secret:', serverSharedSecret);
			const exportedServerSharedSecret = await crypto.subtle.exportKey('jwk', serverSharedSecret);
			return JSON.stringify(exportedServerSharedSecret);
		},


	removePEM: function removePEMFormatting(key) {
		return key.replace(/-----BEGIN PUBLIC KEY-----/, '')
			.replace(/-----END PUBLIC KEY-----/, '')
			.replace(/-----BEGIN PRIVATE KEY-----/, '')
			.replace(/-----END PRIVATE KEY-----/, '');

	}
};
module.exports = serverECDHCrypto;