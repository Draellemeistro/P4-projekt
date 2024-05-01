const crypto = require('crypto');
//const fs = require('fs');

const serverRSACrypto = {
	removePrivKeyHeader: function removePrivKeyHeader(pemFormatServerPrivateRSAKey) {
		const pemHeader = "-----BEGIN PRIVATE KEY-----";
		const pemFooter = "-----END PRIVATE KEY-----";
		let result = pemFormatServerPrivateRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		result = result.trim();
		return Buffer.from(result);
	},

	removePubKeyHeader: function removePubKeyHeader(pemFormatServerPublicRSAKey) {
		const pemHeader = "-----BEGIN PUBLIC KEY-----";
		const pemFooter = "-----END PUBLIC-----";
		let result = pemFormatServerPublicRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		result = result.trim();
		return Buffer.from(result);
	},
	importPubKey: async function importRSAPublicKey(pemFormatServerPublicRSAKey) {
		const publicKey = await crypto.subtle.importKey(
			'spki',
			this.removePubKeyHeader(pemFormatServerPublicRSAKey),
			{
				name: 'RSA-OAEP',
				hash: 'SHA-256'
			},
			true,
			['encrypt']
		);
		return publicKey;
	},
	importPrivKey: async function importRSAPrivateKey(pemFormatServerPrivateRSAKey) {
		const privateKey = await crypto.subtle.importKey(
			'pkcs8',
			this.removePrivKeyHeader(pemFormatServerPrivateRSAKey),
			{
				name: 'RSA-OAEP',
				hash: 'SHA-256'
			},
			true,
			['decrypt']
		);
		return privateKey;
	},

	importBothKeys: function importRSAKeyPair(pemFormatServerPublicRSAKey, pemFormatServerPrivateRSAKey) {
		const serverPublicRSAKey = this.importPubKey(pemFormatServerPublicRSAKey);
		const serverPrivateRSAKey = this.importPrivKey(pemFormatServerPrivateRSAKey);
		return { serverPublicRSAKey, serverPrivateRSAKey };
	},

///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
	decryptWithPrivRSA: function decryptWithPrivateKey(encryptedMessage, privateKeyObject) {
		const buffer = Buffer.from(encryptedMessage, 'base64');
		const privateKey = privateKeyObject.privateKey;
		const decrypted = crypto.privateDecrypt({
				key: privateKey,
				// In order to decrypt the data, we need to specify the
				// same hashing function and padding scheme that we used to
				// encrypt the data in the previous step
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: "sha256",
			},
			buffer);
		return decrypted.toString();
	},
	encryptWithPubRSA: function encryptWithPublicKey(message, publicKeyObject) {
	const buffer = Buffer.from(message);
	const publicKey = publicKeyObject.publicKey;
	const encrypted = crypto.publicEncrypt({
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer
	);
	return encrypted.toString('base64');
	},
	RSAUtilsTest:  function testImportAndEncryption(publicKey, privateKey) {
		const plainMessage = 'Hello, World!';
		console.log('Public Key:', publicKey);
		console.log('Private Key:', privateKey);
		const encrypted = this.encryptWithPubRSA(plainMessage, publicKey);
		const decrypted = this.decryptWithPrivRSA(encrypted, privateKey);
		console.log('Encrypted:', encrypted);
		console.log('Decrypted:', decrypted);
		console.log('plaintext:', plainMessage);
		if (decrypted === plainMessage) {
			console.log('Success:', decrypted === plainMessage);
			return true;
		} else {
			console.log('Failure:', decrypted !== plainMessage);
			return false;
		}
	}
};
module.exports = serverRSACrypto;
//const testPublicRSAKey = fs.readFileSync('./serverPublicKeyRSA.pem', 'utf8');
//const testPrivateRSAKey = fs.readFileSync('./serverPrivateKeyRSA.pem', 'utf8');
//result = this.RSAUtilsTest(testPublicRSAKey, testPrivateRSAKey).then((result) => {
//	console.log(result);
//});
