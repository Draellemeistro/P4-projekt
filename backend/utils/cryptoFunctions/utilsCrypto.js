import crypto from 'crypto';


export async function aaa() {
	return 1;
}

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