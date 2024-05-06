const serverIP = '192.168.0.113';
const serverPort = '3030';
import crypto from 'crypto';
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
export const sendBallotToServer = (ballot, clientPubKeyECDH = 'test', ivValue = 'test') => {
	return fetch(`https://${serverIP}:${serverPort}/insert-ballot`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ballot: ballot, clientPubKeyECDH: clientPubKeyECDH, ivValue: ivValue })
	});
};
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

export const sendBallotToServerAndCheckHash = (ballot) => {
	const clientPubKeyECDH = 'test';
	const ballotHash = crypto.createHash('sha256').update(JSON.stringify(ballot)).digest('hex');
	const serverBallotHash = fetch(`https://${serverIP}:${serverPort}/insert-ballot-and-return-hash`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ clientPubKeyECDH, ballot })
	});
	if (ballotHash === serverBallotHash) {
		return true;
	} else {
		fetch(`https://${serverIP}:${serverPort}/mark-ballot-as-faulty`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ clientPubKeyECDH, ballot })
		});
		return false;
	}
};



