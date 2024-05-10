
export const serverIP = '130.225.39.205';
export const serverPort = '80';

export const fetchEmail = (personId, voteId, clientPublicKey) => {
	return fetch(`http://${serverIP}:${serverPort}/get-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ personId, voteId, clientPublicKey }),
	});
};

export const verify2FA = (twoFactorCode, personId, voteId, pubKey) => {
	return fetch(`http://${serverIP}:${serverPort}/verify-2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ twoFactorCode, personId, voteId, pubKey }),
	});
};

export const getCandidatesFromServer = () => {
	return fetch(`http://${serverIP}:${serverPort}/fetch-candidates`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const sendBallotToServer = (msgForServer) => {
	msgForServer = JSON.parse(msgForServer);
	msgForServer = JSON.stringify(msgForServer);
	return fetch(`http://${serverIP}:${serverPort}/insert-ballot-untouched`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer
	});
};
export const fetchPublicKey = () => {
	return fetch(`http://${serverIP}:${serverPort}/fetch-public-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});

}
export const agreeSharedSecret = (encryptedMessage, clientPublicKey, ivValue) => {
	return fetch(`http://${serverIP}:${serverPort}/agree-shared-secret`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({encryptedMessage: encryptedMessage, clientPublicKey: clientPublicKey, ivValue: ivValue}),
	});
};
export const sendBallotForHandling = async (msgForServer) => {
	return await fetch(`https://${serverIP}:${serverPort}/insert-ballot-double-enc`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer
	});
};