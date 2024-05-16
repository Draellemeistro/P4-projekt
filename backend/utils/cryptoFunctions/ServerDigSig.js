const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { importTemplateDigSig, arrayBufferToBase64, base64ToArrayBuffer } = require('./utilsCrypto');

const serverDigSig = {
	pubKey: null,
	privKey: null,
	clientKey: null,

	loadKeys: async () => {
		serverDigSig.pubKey = await serverDigSig.readPubKeyFromFile();
		serverDigSig.privKey = await serverDigSig.readPrivKeyFromFile();
	},

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
		fs.writeFileSync( path.join(__dirname,'../keys/digSigKeyPub.json'), pubKeyString);
		fs.writeFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), privKeyString);
	},
	readPubKeyFromFile: async function readPubKeyFromFile() {
		const serverPubKeyString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPub.json'), 'utf8');
		return await this.importDigSig(serverPubKeyString, true);
	},
	readPrivKeyFromFile: async function readPrivKeyFromFile() {
		const serverPrivKeyString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), 'utf8');
		return await this.importDigSig(serverPrivKeyString, false);
	},

	readKeysFromFiles:  async function loadKeys() {
		const digSigKeyPubString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPub.json'), 'utf8');
		const digSigKeyPrivString = fs.readFileSync(path.join(__dirname,'../keys/digSigKeyPriv.json'), 'utf8');
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
			signature = base64ToArrayBuffer(signature);
		}
		if(!clientKey){
			return await crypto.subtle.verify(
				{
					name: "ECDSA",
					hash: { name: "SHA-256" },
				},
				this.clientKey, // TODO CLIENT KEY
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
		return arrayBufferToBase64(signature);
	},
	verifyReceivedMessage: async function verifyReceivedMessage(signature, message) {

		return await this.verify(signature, message, this.clientKey).then(r => { // TODO CLIENT KEY
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

	importClientKey: async function importKey(clientKeyString){
		this.clientKey = this.importDigSig(clientKeyString, true); // TODO CLIENT KEY
	},
	importDigSig: async function importDigSig(keyString, isPublic = true) {
		return await importTemplateDigSig(keyString, isPublic);
	},
};
module.exports = serverDigSig;

// Usage