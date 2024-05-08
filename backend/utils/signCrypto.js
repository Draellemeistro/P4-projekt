const crypto = require('crypto');

// Step 1: Generate a pair of keys for signing and verifying
const serverSignCrypto = {
	keyObject: null,
	clientKey: null,
	genKeys:  function generateKeys() {
		return crypto.generateKeyPairSync('ec', {
			namedCurve: 'secp256k1',
			publicKeyEncoding: { type: 'spki', format: 'pem' },
			privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
		});
	},

// Step 2: Use the private key to sign a message
	sign: function signMessage(privateKey, message){
		const sign = crypto.createSign('SHA256');
		sign.update(message);
		sign.end();
		return sign.sign(privateKey);
	},

// Step 3: Use the public key to verify the signature
	verify: function verifySignature(publicKey, signature, message){
		const verify = crypto.createVerify('SHA256');
		verify.update(message);
		verify.end();
		return verify.verify(publicKey, signature);
	},

	exportKey: function exportKey(choicePublic = true){
		let key = this.keyObject.publicKey;
		if (choicePublic === false){
			 key = this.keyObject.privateKey;
		 }
		return crypto.subtle.exportKey("jwk", key);
	},
	importKey: function importKey(key, optionalParams = false, keyTwo = null){
		if (optionalParams === true) {
			this.keyObject.pubKey = crypto.subtle.importKey(
				'jwk',
				key,
				{
					name: 'ECDSA',
					namedCurve: 'P-256',
				},
				true,
				['sign', 'verify'],
			);
			this.keyObject.privKey = crypto.subtle.importKey(
				'jwk',
				keyTwo,
				{
					name: 'ECDSA',
					namedCurve: 'P-256',
				},
		true,
		['sign', 'verify'],
				);
		} else {
			this.clientKey = crypto.subtle.importKey(
				'jwk',
				key,
				{
					name: 'ECDSA',
					namedCurve: 'P-256',
				},
				true,
				['verify'],
			);
		}
	}
}
module.exports = serverSignCrypto;

// Usage
