const crypto = require('crypto');

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

async function hashString(detail) {
	const encoder = new TextEncoder();
	const dataVoteId = encoder.encode(detail.voteId + detail.salt);
	return crypto.createHash('sha256').update(dataVoteId).digest('hex');
}


module.exports = {
	importTemplateRSA,
	importTemplateECDH,
	importTemplateDigSig,
	arrayBufferToBase64,
	base64ToArrayBuffer,
	hashString
	};