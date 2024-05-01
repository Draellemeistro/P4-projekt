const crypto = require('crypto');
//const fs = require('fs');

const serverRSACrypto = {


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
		const publicKey = typeof publicKeyObject === 'string' ? publicKeyObject : publicKeyObject.toString();
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
		const encrypted = serverRSACrypto.encryptWithPubRSA(plainMessage, publicKey);
		const decrypted = serverRSACrypto.decryptWithPrivRSA(encrypted, privateKey);
		if (decrypted === plainMessage) {
			console.log('RSA encryption and decryption:\nSuccess:', decrypted === plainMessage);
			return true;
		} else {
			console.log('Failure:', decrypted !== plainMessage);
			console.log('Decrypted:', decrypted);
			console.log('plaintext:', plainMessage);
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
