/**
 * This module will generate a public and private keypair and save to current directory
 * See https://github.com/zachgoll/express-jwt-authentication-starter for use in creating JWT's using jsonwebtoken and passport.js
 * Make sure to save the private key elsewhere after generated!
 * https://nodejs.org/docs/latest/api/webcrypto.html#class-cryptokey
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
}

function generateECDHKeyPair() {
	const serverECDH = createECDH('secp521r1');
	const serverKeyECDH = serverECDH.generateKeys();
	const serverPublicKeyBase64 = serverECDH.getPublicKey().toString('base64');
	const serverPrivateKeyBase64 = serverECDH.getPrivateKey().toString('base64');
	// Write the PEM formatted key to a file
	const publicPemFormatString = `-----BEGIN PUBLIC KEY-----\n${serverPublicKeyBase64}\n-----END PUBLIC KEY-----`;
const privatePemFormatString = `-----BEGIN PRIVATE KEY-----\n${serverPrivateKeyBase64}\n-----END PRIVATE KEY-----`;
	fs.writeFileSync('../'+__dirname + '/serverPublicKeyECDH.pem', privatePemFormatString);
	fs.writeFileSync('../'+__dirname + '/serverPrivateKeyECDH.pem', publicPemFormatString);

}
function generateDSAKeyPair() {
	const keyPairDSA = crypto.generateKeyPairSync('dsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem'
		}
	});
	// Create the public key file
	fs.writeFileSync(__dirname + '/serverPublicKeyDSA.pem', keyPair.publicKey);

	// Create the private key file
	fs.writeFileSync(__dirname + '/serverPrivateKeyDSA.pem', keyPair.privateKey);
}



// 				Generate the keypair
//generateRSAKeyPair();
//generateECDHKeyPair();
//generateDSAKeyPair();
