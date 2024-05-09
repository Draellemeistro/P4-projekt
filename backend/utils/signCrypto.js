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
	prepareSignatureToSend: function prepareSignForServer(signatureArrBuff64){
		return this.arrayBufferToBase64(signatureArrBuff64);
	},

	arrayBufferToBase64: function (buffer) {
		let uint8Array = new Uint8Array(buffer);
		return btoa(String.fromCharCode.apply(null, uint8Array));
	},
	base64ToArrayBuffer: function(base64) {
		let binaryString = window.atob(base64);
		let len = binaryString.length;
		let bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}


}
module.exports = serverSignCrypto;

// Usage
