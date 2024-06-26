
export const serverIP = '130.225.39.205';
export const serverPort = '443';

export const fetchEmail = async (hashedDetail) => {
	return await fetch(`https://${serverIP}:${serverPort}/get-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ hashedDetail }),
	});
};

export const verify2FA = (twoFactorCode, personId, voteId, pubKeysForServer) => {
	console.log('personId: ', personId);
	return fetch(`https://${serverIP}:${serverPort}/verify-2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ twoFactorCode, personId, voteId, keys: pubKeysForServer }),
	});
};

export const getCandidatesFromServer = (token) => {
	return fetch(`https://${serverIP}:${serverPort}/fetch-candidates`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token

		},
	});
};

export const sendBallotToServer = (msgForServer, token) => {
	return fetch(`https://${serverIP}:${serverPort}/handle-encrypted-ballot`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token

		},
		body: msgForServer
	});
};
export const fetchPublicKey = () => {
	return fetch(`https://${serverIP}:${serverPort}/fetch-public-key`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});

}
export const agreeSharedSecret = async (msgForServer, clientPublicKey) => {
	return await fetch(`https://${serverIP}:${serverPort}/agree-shared-secret`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ msgForServer: msgForServer, clientPublicKey: clientPublicKey }),
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

export const fetchBallots = async () => {
	return await fetch(`https://${serverIP}:${serverPort}/decrypt-full-box`, {
		method: 'POST',
		headers: {
				'Content-Type': 'application/json',
		},
	});
};
