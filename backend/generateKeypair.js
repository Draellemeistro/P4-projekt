/**
 * This module will generate a public and private keypair and save to current directory
 *
 * Make sure to save the private key elsewhere after generated!
 */
const crypto = require('crypto');
const fs = require('fs');
const { createECDH } = require('node:crypto');
const pem2jwk = require('pem-jwk').pem2jwk; //to correctly format/encode and transport RSA key


async function generateRSAKeyPairSubtle() {
	return await crypto.subtle.generateKey(
	{
		name: "RSA-OAEP",
		modulusLength: 4096,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: "SHA-256"
	},
	true,
	["encrypt", "decrypt"]
);
}
function generateRSAKeyPair() {

	// Generates an object where the keys are stored in properties `privateKey` and `publicKey`
	const keyPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096, // bits - standard for RSA keys
		publicKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		},
		privateKeyEncoding: {
			type: 'pkcs1', // "Public Key Cryptography Standards 1"
			format: 'pem' // Most common formatting choice
		}
	});
	//jwkFormatServerPublicRSAKey = pem2jwk(keyPair.publicKey)
	// Create the public key file
	fs.writeFileSync(__dirname + '/serverPublicKeyRSA.pem', keyPair.publicKey);

	// Create the private key file
	fs.writeFileSync(__dirname + '/serverPrivateKeyRSA.pem', keyPair.privateKey);

}
async function initECDH(){
		let keyStringObject;
		const newServerKeyPairECDH = await crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-521"
			},
			true,
			["deriveKey", "deriveBits"]
		);
		const exportedPubKeyECDH = await crypto.subtle.exportKey('jwk', newServerKeyPairECDH.publicKey);
		console.log('client public key as JWK: ', exportedPubKeyECDH);
		const exportedPrivKeyECDH = await crypto.subtle.exportKey('jwk', newServerKeyPairECDH.privateKey);
		// Convert the keys to strings
		const publicKeyString = JSON.stringify(exportedPubKeyECDH);
		const privateKeyString = JSON.stringify(exportedPrivKeyECDH);
		fs.writeFileSync('serverPublicKeyECDH.json', publicKeyString);
		fs.writeFileSync('serverPrivateKeyECDH.json', privateKeyString);
		return {publicKeyString, privateKeyString};
}
function readFileAndConvertToJWK() {
	const keyString = fs.readFileSync(__dirname + '/utils/keys/serverPublicKeyRSA.pem', 'utf8');
	const keyStringObject = pem2jwk(keyString);
	fs.writeFileSync(__dirname + '/serverPublicKeyRSA2.txt', JSON.stringify(keyStringObject));
}
// Generate the keypairs
//generateRSAKeyPair();
//generateECDHKeyPair();
readFileAndConvertToJWK();