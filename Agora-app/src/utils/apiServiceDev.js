/// api calls not meant for production, but useful for development and testing.
const serverIP = '192.168.0.113';
const serverPort = '3030';
//import crypto from 'crypto';

export const exchangeKeys = async (keyRing) => {
	return await fetch(`https://${serverIP}:${serverPort}/request-server-keys`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({keyRing: keyRing}),
	});
}
export const DecryptTestRSA = async (plainTextMessage, encryptedMessage) => {
	let response = await fetch(`https://${serverIP}:${serverPort}/decrypt-RSA-message-Test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ plainTextMessage, encryptedMessage }),
	});
	if (response.ok) {
		return response.json();
	}
	else {
		console.error('Error in DecryptTestRSA: ', response.status);
		return response.status;
	}
}
export const DecryptTestECDH = (objectContainingMessage) => {
	// msgForServer is a stringified object containing several properties, one of which is the encrypted message.
	return fetch(`https://${serverIP}:${serverPort}/ecdh-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ msgForServer: objectContainingMessage })
	});
};
export const DecryptSignedRSA = async (plainTextMessage, encryptedMessage, signature, key) => {
	let response = await fetch(`https://${serverIP}:${serverPort}/decrypt-RSA-plus-sign`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ plainTextMessage, encryptedMessage, signature, key }),
	});
	if (response.ok) {
		return response.json();
	}
	else {
		console.error('Error in DecryptTestRSA: ', response.status);
		return response.status;
	}
}

export const checkSharedSecretTest = async (keyStringSharedSecret, keyStringPub) => {
	return await fetch(`https://${serverIP}:${serverPort}/check-shared-secret-test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			sharedSecret: keyStringSharedSecret,
			clientPublicKey: keyStringPub
		})
	});
}



export const combinedEncryptionTest = (message, encrypted, clientPubKey = null, ivValue = null) => {
	return fetch(`https://${serverIP}:${serverPort}//combined-encryption-test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ message: message, encrypted: encrypted, clientPubKey: clientPubKey, ivValue: ivValue })
	});

}
export const RSAtoECDHTest = (msgForServer, signature, signatureKey) => {
	return fetch(`https://${serverIP}:${serverPort}/rsa-to-ecdh-test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer, signature, signatureKey
	});
}
export const ECDHtoRSATest = (msgForServer) => {
	return fetch(`https://${serverIP}:${serverPort}/ecdh-to-rsa-test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer
	});
}