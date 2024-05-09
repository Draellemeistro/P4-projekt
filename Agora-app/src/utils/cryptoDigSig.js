import { exchangePubSigKeys, signMessage, verifySignature } from './apiService.js';

const signCrypto = {
	// Step 1: Generate a pair of keys for signing and verifying


		pubKey: null,
		privKey: null,
		serverKey: null,


	putGenKeys: function putGenKeys(pubKey, privKey){
		this.pubKey =  pubKey;
		this.privKey = privKey;
	},
	putServerKey: function putServerKey(serverKey){
		this.serverKey = serverKey;
	},

	 genKeys: async function generateKeys() {
		 const keyObject = await window.crypto.subtle.generateKey(
			{
				name: "ECDSA",
				namedCurve: "P-256",
			},
			true,
			["sign", "verify"]
		);
		 this.privKey = keyObject.privateKey;
		 this.pubKey = keyObject.publicKey;
		const pubKey = keyObject.publicKey;
		const privKey = keyObject.privateKey;
		return {pubKey: pubKey, privKey: privKey};
	},

// Step 2: Use the private key to sign a message
	 sign: async function signMessage(message){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		return await window.crypto.subtle.sign(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			this.privKey,
			data
		);
	},

// Step 3: Use the public key to verify the signature
	verify: async function verifySignature(signature, message, serverKey) {
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		if (!serverKey) {
			return await window.crypto.subtle.verify(
				{
					name: "ECDSA",
					hash: { name: "SHA-256" },
				},
				this.serverKey,
				signature,
				data
			);
		} else {
			return await window.crypto.subtle.verify(
				{
					name: "ECDSA",
					hash: { name: "SHA-256" },
				},
				serverKey,
				signature,
				data
			);
		}
	},

	exportKey: async function exportKey(pubKey){
		if (!pubKey){
			pubKey = this.pubKey;
		}
		let exportedKey = await window.crypto.subtle.exportKey("jwk", pubKey);
		console.log('exported key:', exportedKey);
		console.log('exported key as string:', JSON.stringify(exportedKey));
		return exportedKey;
	},

	importServerKey: async function importServerKey(serverKeyString){
			let serverKeyStringParsed;
			let importedKey;
		serverKeyStringParsed = JSON.parse(serverKeyString);

		try {
			console.log('trying to import server key as JWK:', serverKeyStringParsed);
			importedKey = await window.crypto.subtle.importKey('jwk', serverKeyStringParsed, {
				name: 'ECDSA',
				namedCurve: 'P-256'
			}, true, ['verify']);
		} catch (error) {
			console.error('Failed to import server key as parsed string:', error);
			console.log('maybe implementing a JWK workaround will help');
			try {
				console.log('trying to import server key as String:', serverKeyString);
				importedKey = await window.crypto.subtle.importKey('jwk', serverKeyString, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
			} catch (error) {
				console.error('Failed to import server key as regular string:', error);
				console.log('trying to parse server key string, and then import');
			}
		}
		console.log('importedKey:', importedKey);
		console.log('importedKey Type:', typeof importedKey);
		this.putServerKey(importedKey);
		return importedKey;
	},

	exchangeKeys: async function exchangeKeys(){
		let exportedKey = await this.exportKey(this.pubKey);
		let response = await exchangePubSigKeys(exportedKey);
		if (response.status !== 200) {
			console.error('Failed to send public key: ', response.status);
		}
		if (response.ok) {
			const data = await response.data();
			const serverPublicKeyString = data.returnKey;
			return await this.importServerKey(serverPublicKeyString);
		} return response;
	},


	keyExchangeSim: async function keyExchangeSim(){
		let exportedKey = await this.exportKey(this.pubKey);
		let exportedKeyString = JSON.stringify(exportedKey);
		console.log('exportedKeyString:', exportedKeyString);
		let importedKey = await this.importServerKey(exportedKeyString);
		this.putServerKey(importedKey);
		return importedKey;
	},

	askForVerify: async function askForVerify(signature, message){
		signature = this.prepareSignatureToSend(signature);
		let response = await verifySignature(signature, message);
		if (response.ok) {
			await response.json();
			console.log('Signature verified: ', response);
		}
		console.log('Signature verification: ', response);
		return response;
	},
	askForSignature: async function askForSignature(){
		let response = await signMessage();
		if (response.ok) {
			await response.json();
		const signature = response.signature;
		const message = response.message;
		const sigStringToArrBuf = this.base64ToArrayBuffer(signature);
		const isValid = await signCrypto.verify(sigStringToArrBuf, message, this.serverKey);
		console.log('Signature verification: ', isValid);
		return isValid;
		} else {
			console.error('Failed to sign message: ', response.status);
			return response;
		}
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
	},
};


export default signCrypto;
