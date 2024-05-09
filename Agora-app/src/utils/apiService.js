const serverIP = '192.168.0.113';
const serverPort = '3030';
export const fetchEmail = (personId, voteId) => {
	return fetch(`https://${serverIP}:${serverPort}/get-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ personId, voteId }),
	});
};
export const verify2FA = (twoFactorCode, personId, voteId) => {
	return fetch(`https://${serverIP}:${serverPort}/verify-2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ twoFactorCode, personId, voteId }),
	});
};
export const getCandidatesFromServer = () => {
	return fetch(`https://${serverIP}:${serverPort}/fetch-candidates`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const sendBallotToServerRSAtoECDH = async (msgForServer) => {
	return await fetch(`https://${serverIP}:${serverPort}/insert-ballot-double-enc`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer
	});

}

export const sendBlindedForSigning = (blindedMessage) => {
	return fetch(`https://${serverIP}:${serverPort}/sign-blinded-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ blindedMessage })
	});
};




  ///////////////////////////////////
 //	New and/or not implemented		//
///////////////////////////////////
export const exchangePubSigKeys = async (key) => {
	console.log('key:', key);
	return await fetch(`https://${serverIP}:${serverPort}/sig-public-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ clientKeyExport: key }),
	});
};

export const verifySignature = async (signature, message) => {
	return await fetch(`https://${serverIP}:${serverPort}/verify-sig`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ signature: signature, message: message })
	});
};
export const signMessage = async () => {
	return await fetch(`https://${serverIP}:${serverPort}/sign-message`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const fetchKeyRSA = async () => {
	return await fetch(`https://${serverIP}:${serverPort}/rsa-public-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};


export const fetchKeyECDH = async () => {
	return await fetch(`https://${serverIP}:${serverPort}/request-public-ecdh-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};




