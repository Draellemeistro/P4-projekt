/**
 * This module will generate a public and private keypair and save to current directory
 * See https://github.com/zachgoll/express-jwt-authentication-starter for use in creating JWT's using jsonwebtoken and passport.js
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

function importRSAPrivateKey() {
	const pemFormatServerPrivateRSAKey = fs.readFileSync('../serverPrivateKeyRSA.pem', 'utf8');
	const pemHeader = "-----BEGIN PRIVATE KEY-----";
	const pemFooter = "-----END PRIVATE KEY-----";
	let result = pemFormatServerPrivateRSAKey.replace(pemHeader, '');
	result = result.replace(pemFooter, '');
	return result.trim();
}
function importRSAPublicKey() {
	const pemFormatServerPublicRSAKey = fs.readFileSync('../serverPublicKeyRSA.pem', 'utf8');
	const pemHeader = "-----BEGIN PUBLIC KEY-----";
	const pemFooter = "-----END PUBLIC-----";
	let result = pemFormatServerPublicRSAKey.replace(pemHeader, '');
	result = result.replace(pemFooter, '');
	return result.trim();
}
function importRSAKeyPair() {
	const serverPublicRSAKey = importRSAPublicKey();
	const serverPrivateRSAKey = importRSAPrivateKey();
	return { serverPublicRSAKey, serverPrivateRSAKey };
}

///////////////////////////////////////
// 		NOTE: below is from:
// 		https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7
///////////////////////////////////////
function decryptWithPrivateKey(encryptedMessage, privateKey) {
	const buffer = Buffer.from(encryptedMessage, 'base64');
	const decrypted = crypto.privateDecrypt({
			key: privateKey,
			// In order to decrypt the data, we need to specify the
			// same hashing function and padding scheme that we used to
			// encrypt the data in the previous step
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer);
	return decrypted.toString();
}
function encryptWithPublicKey(message, publicKey) {
	const buffer = Buffer.from(message);
	const encrypted = crypto.publicEncrypt({
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		buffer
	);
	return encrypted.toString('base64');
}
function testImportAndEncryption() {
	const { serverPublicRSAKey, serverPrivateRSAKey } = importRSAKeyPair();
	const plainMessage = 'Hello, World!';
	const encrypted = encryptWithPublicKey(plainMessage, serverPublicRSAKey);
	const decrypted = decryptWithPrivateKey(encrypted, serverPrivateRSAKey);
	console.log('Encrypted:', encrypted);
	console.log('Decrypted:', decrypted);
	console.log('plaintext:', plainMessage);
	console.log('Success:', decrypted === plainMessage);
	//this works
}
// 				Generate the keypair
//generateRSAKeyPair();
//generateECDHKeyPair();
//generateDSAKeyPair();
//testImportAndEncryption();	//this works
