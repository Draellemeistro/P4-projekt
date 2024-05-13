const crypto = require('crypto');
const fs = require('fs');


const pem2jwk = require('pem-jwk').pem2jwk; //to correctly format/encode and transport RSA key


const serverRSA = {

	pubKey: null,
	privKey: null,
	pubKeyString:  fs.readFileSync('../keys/serverPublicKeyRSA.pem','utf8'),
	privKeyString: fs.readFileSync('../keys/serverPrivateKeyRSA.pem','utf8'),

///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
	decryptWithPrivRSA: function decryptWithPrivateKey(encryptedMessage, ) {
		const buffer = encryptedMessage instanceof Buffer ? encryptedMessage : Buffer.from(encryptedMessage, 'base64');
		const privateKey = typeof this.privKeyString === 'string' ? this.privKeyString : this.privKeyString.toString();
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

	///////////////////////////////////////
	// 		NOTE: below is UNTESTED, but should work
	//		- it is standardised to match the other functions in ECDH and ECDSA
	///////////////////////////////////////

	genKeys: async function generateKeys() {
		let keys =  await crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: {name: "SHA-256"}
			},
			true,
			["encrypt", "decrypt"]
		);
		this.pubKey = keys.publicKey;
		this.privKey = keys.privateKey;

	},
	saveKeysToFile: async function saveKeysToFile(){
		const pubKeyString = await this.exportKeyToString(this.pubKey);
		const privKeyString = await this.exportKeyToString(this.privKey);
		fs.writeFileSync('../keys/RSAPubKey.json', pubKeyString);
		fs.writeFileSync('../keys/RSAPrivKey.json', privKeyString);
	},
	decryptRSA: async function decryptMessage(encryptedMessage) {
		if(typeof encryptedMessage === 'string') encryptedMessage = this.base64ToArrBuff(encryptedMessage);
		const bufferFromBase64 = Buffer.from(encryptedMessage);
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'RSA-OAEP'
			},
			this.privKey,
			bufferFromBase64
		) /// this may need to be changed to a buffer, use the ArrayBuffer to 64 conversion or likewise
		return this.ArrBuffToString(decrypted);
	},
	encryptRSA: async function encryptMessage(message) {
		const data =  Buffer.from(message);
		return await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			this.pubKey,
			data
		)
	},

	readKeysFromFiles: function importKeys() {
		const serverPubKeyString = fs.readFileSync('../keys/serverPublicKeyRSA.pem','utf8');
		const serverPrivKeyString = fs.readFileSync('../keys/serverPrivateKeyRSA.pem','utf8');
		this.pubKey = this.keyImportTemplateRSA(pem2jwk(serverPubKeyString), true);
		this.privKey = this.keyImportTemplateRSA(pem2jwk(serverPrivKeyString), false);
	},
	keyImportTemplateRSA: async function keyImportTemplateRSA(keyString, isPublic = true) {
		if (typeof keyString === 'string') keyString = JSON.parse(keyString);
		if (isPublic) {
			return await crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'RSA-OAEP',
					hash: { name: 'SHA-256' }
				},
				true,
				['encrypt']
			);
		} else {
			return await crypto.subtle.importKey(
				'jwk',
				keyString,
				{
					name: 'RSA-OAEP',
					hash: { name: 'SHA-256' }
				},
				true,
				['decrypt']
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

	ArrBuffToString: function convertArrayBufferToBase64(message) {
		return Buffer.from(message).toString();
		//return Buffer.from(arrayBuffer).toString('base64');
	},
	ArrBuffToBase64: function arrayBufferToBase64(buffer) {
	return Buffer.from(buffer).toString('base64');
	},
	base64ToArrBuff: function base64ToArrayBuffer(base64) {
	return Buffer.from(base64, 'base64');
	},
	stringToArrBuff: function convertBase64ToArrayBuffer(plaintext) {
		return Buffer.from(plaintext);
		//return Buffer.from(base64String, 'base64');
	},
};
module.exports = serverRSA;
//const testPublicRSAKey = fs.readFileSync('./serverPublicKeyRSA.pem', 'utf8');
//const testPrivateRSAKey = fs.readFileSync('./serverPrivateKeyRSA.pem', 'utf8');
//result = this.RSAUtilsTest(testPublicRSAKey, testPrivateRSAKey).then((result) => {
//	console.log(result);
//});
