import RSACrypto from './encryptionRSA.js';

export async function sendPublicKeysToServer(RSAPublicKeyJWK, ECDHPublicKeyJWK, serverPublicKey) {
	const bothPublicKeys = { RSAPublicKey: RSAPublicKeyJWK, ECDHPublicKey: ECDHPublicKeyJWK };
		const encryptedPublicKeys = await RSACrypto.encrypt(JSON.stringify(bothPublicKeys), serverPublicKey);
		return await fetch(`https://server.com/client-public-keys`, {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: encryptedPublicKeys,
		});
}