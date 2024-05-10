const crypto = require('crypto');
const fs = require('fs');


const path = require('path');
const pem2jwk = require('pem-jwk').pem2jwk; //to correctly format/encode and transport RSA key


const serverRSA = {

	serverPubKey:  fs.readFileSync(path.join(__dirname, '../keys/serverPublicKeyECDH.pem'),'utf8'),
	serverPrivKey: fs.readFileSync(path.join(__dirname, '../keys/serverPrivateKeyECDH.pem'),'utf8'),

///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
	decryptWithPrivRSA: function decryptWithPrivateKey(encryptedMessage, ) {
		const buffer = encryptedMessage instanceof Buffer ? encryptedMessage : Buffer.from(encryptedMessage, 'base64');
		const privateKey = typeof this.serverPubKey === 'string' ? this.serverPubKey : this.serverPubKey.toString();
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
	}
};
module.exports = serverRSA;
//const testPublicRSAKey = fs.readFileSync('./serverPublicKeyRSA.pem', 'utf8');
//const testPrivateRSAKey = fs.readFileSync('./serverPrivateKeyRSA.pem', 'utf8');
//result = this.RSAUtilsTest(testPublicRSAKey, testPrivateRSAKey).then((result) => {
//	console.log(result);
//});
