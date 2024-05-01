const crypto = require('crypto');
const fs = require('fs');

const serverRSACrypto = {
	importPrivKey: function importRSAPrivateKey() {
		const pemFormatServerPrivateRSAKey = fs.readFileSync('../serverPrivateKeyRSA.pem', 'utf8');
		const pemHeader = "-----BEGIN PRIVATE KEY-----";
		const pemFooter = "-----END PRIVATE KEY-----";
		let result = pemFormatServerPrivateRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		return result.trim();
	},
	importPubKey: function importRSAPublicKey() {
		const pemFormatServerPublicRSAKey = fs.readFileSync('../serverPublicKeyRSA.pem', 'utf8');
		const pemHeader = "-----BEGIN PUBLIC KEY-----";
		const pemFooter = "-----END PUBLIC-----";
		let result = pemFormatServerPublicRSAKey.replace(pemHeader, '');
		result = result.replace(pemFooter, '');
		return result.trim();
	},
	importBothKeys: function importRSAKeyPair() {
		const serverPublicRSAKey = importRSAPublicKey();
		const serverPrivateRSAKey = importRSAPrivateKey();
		return { serverPublicRSAKey, serverPrivateRSAKey };
	},
///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
	decryptWithPrivRSA: function decryptWithPrivateKey(encryptedMessage, privateKey) {
		const buffer = Buffer.from(encryptedMessage, 'base64');
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
	encryptWithPubRSA: function encryptWithPublicKey(message, publicKey) {
	const buffer = Buffer.from(message);
	const encrypted = crypto.publicEncrypt({
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer
	);
	return encrypted.toString('base64');
	},
	RSAUtilsTest: function testImportAndEncryption() {
	const { serverPublicRSAKey, serverPrivateRSAKey } = importRSAKeyPair();
	const plainMessage = 'Hello, World!';
	const encrypted = encryptWithPublicKey(plainMessage, serverPublicRSAKey);
	const decrypted = decryptWithPrivateKey(encrypted, serverPrivateRSAKey);
	console.log('Encrypted:', encrypted);
	console.log('Decrypted:', decrypted);
	console.log('plaintext:', plainMessage);
	console.log('Success:', decrypted === plainMessage);
	//this works
}
};
module.exports = serverRSACrypto;
//testImportAndEncryption();	//this works
