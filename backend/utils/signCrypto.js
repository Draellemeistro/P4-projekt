const crypto = require('crypto');

// Step 1: Generate a pair of keys for signing and verifying
const serverSignCrypto = {

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
	exportKey: async function exportKey(choicePublic = true){
		let key;
		key = this.pubKey;
		if (choicePublic === false){
			key = this.privKey;
		}
		return  await crypto.subtle.exportKey("jwk", key)
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

	importKey: async function importKey(clientKeyString){
		let clientKeyStringParsed;
		let importedKey;
		clientKeyStringParsed = JSON.parse(clientKeyString);

		try {
			console.log('trying to import server key as JWK:', clientKeyStringParsed);
			importedKey = await crypto.subtle.importKey('jwk', clientKeyStringParsed, {
				name: 'ECDSA',
				namedCurve: 'P-256'
			}, true, ['verify']);
		} catch (error) {
			console.error('Failed to import server key as parsed string:', error);
			console.log('maybe implementing a JWK workaround will help');
			try {
				console.log('trying to import server key as String:', clientKeyString);
				importedKey = await crypto.subtle.importKey('jwk', clientKeyString, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
			} catch (error) {
				console.error('Failed to import server key as regular string:', error);
				console.log('trying to parse server key string, and then import');
			}
		}
		this.clientKey = importedKey;
		return importedKey;
	},
	prepareSignatureToSend: function prepareSignForServer(message){
		let signature = this.sign(message);
		return signature.then((sig) => {
			return this.arrayBufferToBase64(sig);
		});
	},
	verifyReceivedMessage: async function verifyReceivedMessage(signature, message, clientKey) {
		let sigStringToArrBuf = this.base64ToArrayBuffer(signature);
		console.log('clientKey:', clientKey);
		console.log('clientKey type:', typeof clientKey);
		let importedKey = await this.importKey(clientKey);
		return await serverSignCrypto.verify(sigStringToArrBuf, message, importedKey);
	},

	arrayBufferToBase64: function (buffer) {
		let uint8Array = new Uint8Array(buffer);
		return Buffer.from(uint8Array).toString('base64');
	},
	base64ToArrayBuffer: function(base64String) {
			let binaryString = Buffer.from(base64String, 'base64').toString('binary');
			let arrayBuffer = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				arrayBuffer[i] = binaryString.charCodeAt(i);
			}
			return arrayBuffer;
		},


}
module.exports = serverSignCrypto;

// Usage
