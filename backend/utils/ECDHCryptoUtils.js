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
	removePEM: function removePEMFormatting(key) {
		return key.replace(/-----BEGIN PUBLIC KEY-----/, '')
			.replace(/-----END PUBLIC KEY-----/, '')
			.replace(/-----BEGIN PRIVATE KEY-----/, '')
			.replace(/-----END PRIVATE KEY-----/, '');

	}
};
module.exports = serverECDHCrypto;