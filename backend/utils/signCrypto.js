const crypto = require('crypto');

// Step 1: Generate a pair of keys for signing and verifying
const serverSignCrypto = {
	keyObject: null,
	pubKey: null,
	privKey: null,
	serverKey: null,


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
		return keys;
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
	verify: async function verifySignature(publicKey, signature, message){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		return await crypto.subtle.verify(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			publicKey,
			signature,
			data
		);
	},
	exportKey: async function exportKey(choicePublic = true){
		let key = this.keyObject.publicKey;
		if (choicePublic === false){
			key = this.keyObject.privateKey;
		}
		return JSON.stringify({clientKey: await crypto.subtle.exportKey("jwk", key)});
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
			try {
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
			} catch (error) {
				console.log('Error importing key:', error);
				try {
					this.clientKey = crypto.subtle.importKey(
						'jwk',
						JSON.parse(key),
						{
							name: 'ECDSA',
							namedCurve: 'P-256',
						},
						true,
						['verify'],
					);
				} catch (error) {
					console.log('Error importing key:', error);
				}
			}
		}
	}
}
module.exports = serverSignCrypto;

// Usage
