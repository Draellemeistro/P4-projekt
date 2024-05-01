const crypto = require('crypto');
//const fs = require('fs');

const serverRSACrypto = {
	removePrivKeyHeader: function removePrivKeyHeader(pemFormatServerPrivateRSAKey) {
		console.log('pemFormatServerPrivateRSAKey:', pemFormatServerPrivateRSAKey)
		const pemHeader = "-----BEGIN RSA PRIVATE KEY-----";
		const pemFooter = "-----END RSA PRIVATE KEY-----";
		let result = pemFormatServerPrivateRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		result = result.trim();
		console.log('private key result:', result);
		return result
	},

	removePubKeyHeader: function removePubKeyHeader(pemFormatServerPublicRSAKey) {
		console.log('pemFormatServerPublicRSAKey:', pemFormatServerPublicRSAKey)
		const pemHeader = "-----BEGIN RSA PUBLIC KEY-----";
		const pemFooter = "-----END RSA PUBLIC KEY-----";
		let result = pemFormatServerPublicRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		result = result.trim();
		console.log('public key result:', result);
		return result
	},


	importBothKeys: function importRSAKeyPair(pemFormatServerPublicRSAKey, pemFormatServerPrivateRSAKey) {
		console.log('\n\n\n\n\n');
		console.log('pemFormatServerPublicRSAKey:', pemFormatServerPublicRSAKey);
		console.log('lige over se');
		console.log('\n\n\n\n\n');
		const serverPublicRSAKey = serverRSACrypto.removePubKeyHeader(pemFormatServerPublicRSAKey);
		const serverPrivateRSAKey = serverRSACrypto.removePrivKeyHeader(pemFormatServerPrivateRSAKey);
		console.log('importBothKeys output:', serverPublicRSAKey, serverPrivateRSAKey);
		console.log('1\n2\n3\n4\n5\n6');

		return { serverPublicRSAKey, serverPrivateRSAKey };
	},

///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
	decryptWithPrivRSA: function decryptWithPrivateKey(encryptedMessage, privateKeyObject) {
		const buffer = Buffer.from(encryptedMessage, 'base64');
		const privateKey = Buffer.from(privateKeyObject);
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
	},//
	encryptWithPubRSA: function encryptWithPublicKey(message, publicKeyObject) {
		const buffer = Buffer.from(message);
		console.log('publicKeyObject:', publicKeyObject);
		const publicKey = typeof publicKeyObject === 'string' ? publicKeyObject : publicKeyObject.toString();
		const encrypted = crypto.publicEncrypt({
				key: publicKey,
			  format: 'pem',
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
		const encrypted = serverRSACrypto.encryptWithPubRSA(plainMessage, publicKey);
		const decrypted = serverRSACrypto.decryptWithPrivRSA(encrypted, privateKey);
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
