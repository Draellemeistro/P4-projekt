import { exchangePubSigKeys } from './apiService.js';

const signCrypto = {
	// Step 1: Generate a pair of keys for signing and verifying
	keyObject: this.genKeys(),
	pubKey: this.keyObject.publicKey,
	privKey: this.keyObject.privateKey,
	serverKey: null,


	 genKeys: async function generateKeys() {
		return  await window.crypto.subtle.generateKey(
			{
				name: "ECDSA",
				namedCurve: "P-256",
			},
			true,
			["sign", "verify"]
		);
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
	verify: async function verifySignature(publicKey, signature, message){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		return await window.crypto.subtle.verify(
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
		return JSON.stringify({clientKey: await window.crypto.subtle.exportKey("jwk", key)});
	},

	exchangeKeys: async function exchangeKeys(){
		let responseKey;
		 let response = await exchangePubSigKeys(this.exportKey());
		if (response.status !== 200) {
			console.error('Failed to send public key: ', response.status);
		}
		if (response.ok) {
			const data = await response.json();
			const serverPublicKeyString = data.returnKey;
			if(typeof serverPublicKeyString === 'string'){
				responseKey = JSON.parse(serverPublicKeyString);
				console.log('Server public key:', responseKey);
			}
			this.serverKey = await window.crypto.subtle.importKey('jwk', responseKey, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);

		}
	},


};
export default signCrypto;