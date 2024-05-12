
const digSig = {
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

	exportKeyToString: async function exportKey(pubKey){
		if (!pubKey){
			pubKey = this.pubKey;
		}
		return JSON.stringify(await window.crypto.subtle.exportKey('jwk', pubKey));
	},
	importKeyTemplate: async function importKeyTemplate(keyString, isPublic = true){
		if (typeof keyString === 'string') {
			keyString = JSON.parse(keyString);
		}
		if (isPublic === true) {
			return await window.crypto.subtle.importKey('jwk', keyString, {
				name: 'ECDSA',
				namedCurve: 'P-256'
			}, true, ['verify']);
		} else {
			return await window.crypto.subtle.importKey('jwk', keyString, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['sign']);
		}
	},

	saveServerKey: async function importServerKey(serverKeyString){
		let importedKey = await this.importKeyTemplate(serverKeyString, true);
		this.putServerKey(importedKey);
		return importedKey;
	},

	prepareSignatureToSend: function prepareSignForServer(message){
		let signature = this.sign(message);
		return signature.then((sig) => {
			return this.arrayBufferToBase64(sig);
		});
	},
	verifyReceivedMessage: function verifyReceivedMessage(signature, message) {
		let sigStringToArrBuf = this.base64ToArrayBuffer(signature);
		return this.verify(sigStringToArrBuf, message, this.serverKey).then(r => {
			return r;
		});

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


export default digSig;