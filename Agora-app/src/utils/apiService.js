const serverIP = '130.225.39.205';
const serverPort = '80';

export const fetchEmail = (personId, voteId) => {
	return fetch(`http://${serverIP}:${serverPort}/get-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ personId, voteId }),
	});
};

export const verify2FA = (twoFactorCode, personId, voteId) => {
	return fetch(`http://${serverIP}:${serverPort}/verify-2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ twoFactorCode, personId, voteId }),
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

export const sendBallotToServer = (ballot) => {
	const clientPubKeyECDH = 'test';
	return fetch(`http://${serverIP}:${serverPort}/insert-ballot`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ clientPubKeyECDH, ballot })
	});
};