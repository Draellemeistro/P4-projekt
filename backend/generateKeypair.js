/**
 * This module will generate a public and private keypair and save to current directory
 *
 * Make sure to save the private key elsewhere after generated!
 */
const crypto = require('crypto');
const fs = require('fs');
const { createECDH } = require('node:crypto');

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
	// Create the public key file
	fs.writeFileSync(__dirname + '/serverPublicKeyRSA.pem', keyPair.publicKey);

	// Create the private key file
	fs.writeFileSync(__dirname + '/serverPrivateKeyRSA.pem', keyPair.privateKey);
	keyPair.

}
function generateECDHKeyPair() {
	const serverECDH = createECDH('secp521r1');
	const serverKeyECDH = serverECDH.generateKeys();
	const serverPublicKeyBase64 = serverECDH.getPublicKey().toString('base64');
	const serverPrivateKeyBase64 = serverECDH.getPrivateKey().toString('base64');
	// Write the PEM formatted key to a file
	fs.writeFileSync(__dirname + '/serverPublicKeyECDH.pem', serverPublicKeyBase64);
	fs.writeFileSync(__dirname + '/serverPrivateKeyECDH.pem', serverPrivateKeyBase64);
}
// Generate the keypairs
//generateRSAKeyPair();
//generateECDHKeyPair();
