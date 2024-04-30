const serverIP = '130.225.39.205';
const serverPort = '3000';
import crypto from 'crypto';
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

export const sendBlindedForSigning = (blindedMessage) => {
	return fetch(`http://${serverIP}:${serverPort}/sign-blinded-msg`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ blindedMessage })
	});
};

export const askForDecryptToCheck = (encryptedBallot) => {
	return fetch(`http://${serverIP}:${serverPort}/decrypt-RSA-message-Test'`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ encryptedBallot })
	});
}

export const sendBallotToServerAndCheckHash = (ballot) => {
	const clientPubKeyECDH = 'test';
	const ballotHash = crypto.createHash('sha256').update(JSON.stringify(ballot)).digest('hex');
	const serverBallotHash = fetch(`http://${serverIP}:${serverPort}/insert-ballot-and-return-hash`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ clientPubKeyECDH, ballot })
	});
	if (ballotHash === serverBallotHash) {
		return true;
	} else {
		fetch(`http://${serverIP}:${serverPort}/mark-ballot-as-faulty`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ clientPubKeyECDH, ballot })
		});
		return false;
	}
};