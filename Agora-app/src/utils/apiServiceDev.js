/// api calls not meant for production, but useful for development and testing.
export const serverIP = '130.225.39.205';
export const serverPort = '80';
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
	return  await fetch(`https://${serverIP}:${serverPort}/rsa-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ plaintext: plainTextMessage, encrypted: encryptedMessage }),
	});
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

export const sendSignedMessage = async (message, signature) => {
	return await fetch(`https://${serverIP}:${serverPort}/sign-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body:  JSON.stringify({ message: message, signature: signature }),
	});
	}

export const requestMsgToVerify = async () => {
	return await fetch(`https://${serverIP}:${serverPort}/verify-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
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