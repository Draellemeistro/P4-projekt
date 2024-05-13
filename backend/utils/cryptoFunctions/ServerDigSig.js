const crypto = require('crypto');
const fs = require('fs');

const serverDigSig = {

	pubKey: null,
	privKey: null,
	clientKey: null,


	genKeys: async function generateKeys() {
		let keys =  await crypto.subtle.generateKey(
			{
				name: "ECDSA",
				namedCurve: "P-256",
			},
			true,
			["sign", "verify"]
		);
		this.pubKey = keys.publicKey;
		this.privKey = keys.privateKey;
	},
	saveKeysToFile: async function saveKeysToFile(){
		const pubKeyString = await this.exportKeyToString();
		const privKeyString = await this.exportKeyToString(false);
		fs.writeFileSync( './utils/keys/digSigKeyPub.json', pubKeyString);
		fs.writeFileSync('./utils/keys/digSigKeyPriv.json', privKeyString);
	},

	readKeysFromFiles:  async function loadKeys() {
		const digSigKeyPubString = fs.readFileSync('./utils/keys/digSigKeyPub.json', 'utf8');
		const digSigKeyPrivString = fs.readFileSync('./utils/keys/digSigKeyPriv.json', 'utf8');
		const digSigKeyPub = JSON.parse(digSigKeyPubString);
		const digSigKeyPriv = JSON.parse(digSigKeyPrivString);
		this.pubKey = await crypto.subtle.importKey('jwk', digSigKeyPub, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['verify']);
		this.privKey = await crypto.subtle.importKey('jwk', digSigKeyPriv, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['sign']);
	},



// Step 2: Use the private key to sign a message
	sign: async function signMessage(message){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		return await crypto.subtle.sign(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			this.privKey,
			data
		);
	},



// Step 3: Use the public key to verify the signature
	verify: async function verifySignature(signature, message, clientKey){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		if (typeof signature === 'string'){
			signature = this.base64ToArrayBuffer(signature);
		}
		if(!clientKey){
			return await crypto.subtle.verify(
				{
					name: "ECDSA",
					hash: { name: "SHA-256" },
				},
				this.clientKey,
				signature,
				data
			);
		} else{
			return await crypto.subtle.verify(
				{
					name: "ECDSA",
					hash: { name: "SHA-256" },
				},
				clientKey,
				signature,
				data
			);
		}},


	prepareSignatureToSend: async function prepareSignForServer(message) {
		let signature = await this.sign(message);
		return this.arrayBufferToBase64(signature);
	},
	verifyReceivedMessage: async function verifyReceivedMessage(signature, message) {
		const clientKey = await crypto.subtle.exportKey('jwk', serverDigSig.clientKey);
		console.log(JSON.stringify(clientKey));
		let sigStringToArrBuf = this.base64ToArrayBuffer(signature);
		return this.verify(sigStringToArrBuf, message, this.clientKey).then(r => {
			return r;
		});
	},


	exportKeyToString: async function exportKey(choicePublic = true){
		let key;
		key = this.pubKey;
		if (choicePublic === false){
			key = this.privKey;
		}
		return  JSON.stringify(await crypto.subtle.exportKey('jwk', key));
	},
	importServerKeys: function importServerKeys(pubKey, privKey){
		this.pubKey = crypto.subtle.importKey(
			'jwk',
			pubKey,
			{
				name: 'ECDSA',
				namedCurve: 'P-256',
			},
			true,
			['verify'],
		);
		this.privKey = crypto.subtle.importKey(
			'jwk',
			privKey,
			{
				name: 'ECDSA',
				namedCurve: 'P-256',
			},
			true,
			['sign'],
		);
	},

	importClientKey: async function importKey(clientKeyString, isPublic = true){
		let clientKeyStringParsed;
		let importedKey;
		if (typeof clientKeyString ==='string') {
			clientKeyStringParsed = JSON.parse(clientKeyString);
		} else{
			clientKeyStringParsed = clientKeyString;
		}
  if(isPublic){
		importedKey = await crypto.subtle.importKey('jwk', clientKeyStringParsed, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['verify']);
	} else {
		importedKey = await crypto.subtle.importKey('jwk', clientKeyStringParsed, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['sign']);
	}
		this.clientKey = importedKey;
		return importedKey;
	},

	arrayBufferToBase64: function (buffer) {
		return Buffer.from(buffer).toString('base64');
	},
	base64ToArrayBuffer: function(base64) {
		return Buffer.from(base64, 'base64');

	},


}
module.exports = serverDigSig;

// Usage