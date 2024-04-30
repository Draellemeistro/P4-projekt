
const crypto = require('crypto');
const fs = require('fs');
const serverPublicKeyECDH = fs.readFileSync(__dirname + '/serverPublicKeyECDH.pem', 'utf8');
const serverPrivateKeyECDH = fs.readFileSync(__dirname + '/serverPrivateKeyECDH.pem', 'utf8');
const serverPublicRSAKey = fs.readFileSync(__dirname + '/serverPublicKeyRSA.pem', 'utf8');
const serverPrivateRSAKey = fs.readFileSync(__dirname + '/serverPrivateKeyRSA.pem', 'utf8');


///////////////////////////////////////
// RSA
///////////////////////////////////////
function getPubKeyRSA() {
	return serverPublicRSAKey;
}
function getPrivKeyRSA() {
	return serverPrivateRSAKey;
}
function getPubKeyECDH()  {
	return serverPublicKeyECDH;
}
function getPrivKeyECDH()  {
	return serverPrivateKeyECDH;
}
function encryptWithPublicKey(message, publicKey) {
	const buffer = Buffer.from(message, 'utf8');
	const encrypted = crypto.publicEncrypt(publicKey, buffer);
	return encrypted.toString('base64');
}
function decryptWithPrivateKey(encryptedMessage, privateKey) {
	const buffer = Buffer.from(encryptedMessage, 'base64');
	const decrypted = crypto.privateDecrypt(privateKey, buffer);
	return decrypted.toString('utf8');
}


///////////////////////////////////////
// ECDH
///////////////////////////////////////
// create ECDH, request serverECDH, compute secret, encrypt message ....
function initECDH() {
	return crypto.subtle.generateKey(
		{
			name: "ECDH",
			namedCurve: "P-521"
		},
		true,
		["deriveKey", "deriveBits"]
	).then(function(keyPair){
		// Returns the public and private keys
		//console.log(keyPair.publicKey);
		console.log('this far');
		console.log(keyPair);
		return keyPair;
		//console.log(keyPair.privateKey);
	}).catch(function(err){
		console.error(err);
	});
}

///////////////////////////////////////
// Blind Signature
///////////////////////////////////////

function doECDH() {
	let clientECDH = initECDH();
	console.log('hrere?');
	return 123;
}
function doRSA() {
	let msg = "Hello, World!";
	let encMessage = encryptWithPublicKey(msg, getPubKeyRSA());

	// TODO do JSON.stringify(encMessage) and mimic the frontend

	let decMessage = decryptWithPrivateKey(encMessage, getPrivKeyRSA());
	console.log(encMessage, decMessage);
	if (msg === decMessage) {
		console.log("RSA works!");
		return true;
	}


}
function doBlindSignature() {
	return 123;
}

doRSA();
doECDH();