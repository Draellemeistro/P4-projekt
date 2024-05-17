

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { importTemplateDigSig, arrayBufferToBase64, base64ToArrayBuffer } = require('./serverCryptoUtils');

class serverDigSig {
	constructor() {
		this.pubKey = null;
		this.privKey =null;
		this.loadKeys().then(r => {
			console.log(r);
		});
	}

	async loadKeys(){
		this.pubKey = await this.readPubKeyFromFile();
		this.privKey = await this.readPrivKeyFromFile();
		return 'Digital Signature keys loaded';
	}

	async genKeys() {
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
	}



	async readPubKeyFromFile() {
		const serverPubKeyString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPub.json'), 'utf8');
		return await this.importDigSig(serverPubKeyString, true);
	}

	async readPrivKeyFromFile() {
		const serverPrivKeyString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), 'utf8');
		return await this.importDigSig(serverPrivKeyString, false);
	}



// Step 2: Use the private key to sign a message
	async sign(message){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		const signature = await crypto.subtle.sign(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			this.privKey,
			data
		);
		return arrayBufferToBase64(signature);
	}

// Step 3: Use the public key to verify the signature
	async verify(signature, message, clientKey){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		if (typeof signature === 'string'){
			signature = base64ToArrayBuffer(signature);
		}
		return await crypto.subtle.verify(
			{
				name: "ECDSA",
				hash: { name: "SHA-256" },
			},
			clientKey,
			signature,
			data
		);

	}

	async exportKeyToString(choicePublic = true){
		let key;
		key = this.pubKey;
		if (choicePublic === false){
			key = this.privKey;
		}
		return  JSON.stringify(await crypto.subtle.exportKey('jwk', key));
	}

	getPubKey() {
		return this.pubKey;
	}

	async importDigSig(keyString, isPublic = true) {
		return await importTemplateDigSig(keyString, isPublic);
	}
}
module.exports = new serverDigSig();

// Usage
//async readKeysFromFile() {
//	const digSigKeyPubString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPub.json'), 'utf8');
//	const digSigKeyPrivString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), 'utf8');
//	const digSigKeyPub = JSON.parse(digSigKeyPubString);
//	const digSigKeyPriv = JSON.parse(digSigKeyPrivString);
//	this.pubKey = await crypto.subtle.importKey('jwk', digSigKeyPub, {
//		name: 'ECDSA',
//		namedCurve: 'P-256'
//	}, true, ['verify']);
//	this.privKey = await crypto.subtle.importKey('jwk', digSigKeyPriv, {
//		name: 'ECDSA',
//		namedCurve: 'P-256'
//	}, true, ['sign']);
//}
//async saveKeysToFile (){
//	const pubKeyString = await this.exportKeyToString();
//	const privKeyString = await this.exportKeyToString(false);
//	fs.writeFileSync( path.join(__dirname,'../keys/digSigKeyPub.json'), pubKeyString);
//	fs.writeFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), privKeyString);
//}
//