
export const serverIP = '130.225.39.205';
export const serverPort = '443';

export const fetchEmail = (hashedDetail) => {
	return fetch(`https://${serverIP}:${serverPort}/get-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({hashedDetail}),
	});
};

export const verify2FA = (twoFactorCode, personId, voteId, pubKeysForServer) => {
	console.log('pubKeysForServer: ', pubKeysForServer);
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
