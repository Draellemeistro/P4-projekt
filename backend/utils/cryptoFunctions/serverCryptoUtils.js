const crypto = require('crypto');
const serverECDH = require('./serverECDH');
const serverRSA = require('./serverRSA');
const serverDigSig = require('./serverDigSig');


 async function importTemplateRSA(keyString, isPublic = true) {
	if (typeof keyString === 'string') keyString = JSON.parse(keyString);
	if (!keyString.kty || keyString.kty !== 'RSA') {
		throw new Error('Invalid JWK: "kty" parameter should be "RSA"');
	}
	if (isPublic) {
		return await crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'RSA-OAEP',
				hash: { name: 'SHA-256' }
			},
			true,
			['encrypt']
		);
	} else {
		return await crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'RSA-OAEP',
				hash: { name: 'SHA-256' }
			},
			true,
			['decrypt']
		);
	}
}

 async function importTemplateECDH(keyString, isPublic = true) {

	if(typeof keyString === 'string') keyString = JSON.parse(keyString);
	if (isPublic === true) {
		return await crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'ECDH',
				namedCurve: 'P-521',
			},
			true,
			[],
		);
	} else {
		return await crypto.subtle.importKey(
			'jwk',
			keyString,
			{
				name: 'ECDH',
				namedCurve: 'P-521',
			},
			true,
			["deriveKey", "deriveBits"],
		);
	}
}
 async function importTemplateDigSig(keyString, isPublic = true) {
	if (typeof keyString === 'string') keyString = JSON.parse(keyString);
	if(isPublic){
		return await crypto.subtle.importKey('jwk', keyString, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['verify']);
	} else {
		return  await crypto.subtle.importKey('jwk', keyString, {
			name: 'ECDSA',
			namedCurve: 'P-256'
		}, true, ['sign']);
	}
}

 function arrayBufferToBase64 (buffer) {
	return Buffer.from(buffer).toString('base64');
}

 function base64ToArrayBuffer(base64) {
	return Buffer.from(base64, 'base64');
}
 function exportKeyToString(key){
	return  JSON.stringify(crypto.subtle.exportKey('jwk', key));
}
 function exportPublicKeys() {
	const rsa = exportKeyToString(serverRSA.getPubKey());
	const ecdh = exportKeyToString(serverECDH.getPubKey());
	const digSig = exportKeyToString(serverDigSig.getPubKey());
	return { RSA: rsa, ECDH: ecdh, DigSig: digSig };
}
 function allKeysAreLoaded() {
	return publicKeysAreLoaded() && privateKeysAreLoaded();
}
function publicKeysAreLoaded() {
	return serverECDH.pubKey !== null && serverRSA.pubKey !== null && serverDigSig.pubKey !== null;
}

function privateKeysAreLoaded() {
	return serverECDH.privKey !== null && serverRSA.privKey !== null && serverDigSig.privKey !== null;
}
// serverECDH.getPubKey() === null || serverRSA.getPubKey() === null || serverDigSig.getPubKey() === null
 async function loadAllKeys() {
	await serverRSA.loadKeys();
	await serverECDH.loadKeys();
	await serverDigSig.loadKeys();
	return 'Keys loaded successfully.'
}
module.exports = {
	importTemplateRSA,
	importTemplateECDH,
	importTemplateDigSig,
	arrayBufferToBase64,
	base64ToArrayBuffer,
	exportKeyToString,
	exportPublicKeys,
	allKeysAreLoaded,
	publicKeysAreLoaded,
	privateKeysAreLoaded,
	loadAllKeys
};