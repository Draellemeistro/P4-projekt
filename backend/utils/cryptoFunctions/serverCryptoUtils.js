import crypto from 'crypto';
const serverECDH = require('./serverECDH');
const serverRSA = require('./serverRSA');
const serverDigSig = require('./serverDigSig');


export async function importTemplateRSA(keyString, isPublic = true) {
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

export async function importTemplateECDH(keyString, isPublic = true) {

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
export async function importTemplateDigSig(keyString, isPublic = true) {
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

export function arrayBufferToBase64 (buffer) {
	return Buffer.from(buffer).toString('base64');
}

export function base64ToArrayBuffer(base64) {
	return Buffer.from(base64, 'base64');
}
export function exportKeyToString(key){
	return  JSON.stringify(crypto.subtle.exportKey('jwk', key));
}
export function exportPublicKeys() {
	const rsa = exportKeyToString(serverRSA.getPubKey());
	const ecdh = exportKeyToString(serverECDH.getPubKey());
	const digSig = exportKeyToString(serverDigSig.getPubKey());
	return { RSA: rsa, ECDH: ecdh, DigSig: digSig };
}
export function allKeysAreLoaded() {
	return publicKeysAreLoaded() && privateKeysAreLoaded();
}
function publicKeysAreLoaded() {
	return serverECDH.getPubKey() !== null && serverRSA.getPubKey() !== null && serverDigSig.getPubKey() !== null;
}

function privateKeysAreLoaded() {
	return serverECDH.privKey !== null && serverRSA.privKey !== null && serverDigSig.privKey !== null;
}
// serverECDH.getPubKey() === null || serverRSA.getPubKey() === null || serverDigSig.getPubKey() === null
export async function loadAllKeys() {
	await serverRSA.loadKeys();
	await serverECDH.loadKeys();
	await serverDigSig.loadKeys();
	return 'Keys loaded successfully.'
}