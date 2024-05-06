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
export const sendBallotToServer = (ballot) => {
	const clientPubKeyECDH = 'test';
	return fetch(`https://${serverIP}:${serverPort}/insert-ballot`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ clientPubKeyECDH, ballot })
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

export const checkSharedSecret = (keyStringSharedSecret, keyStringPub) => {
	return fetch(`https://${serverIP}:${serverPort}/check-shared-secret`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			sharedSecret: keyStringSharedSecret,
			clientPublicKey: keyStringPub
		})
	});
};

export const messageDecryptTestECDH = (msgForServer) => {
	// msgForServer is a stringified object containing several properties, one of which is the encrypted message.
	return fetch(`https://${serverIP}:${serverPort}/decrypt-ECDH-message-Test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: msgForServer
	});
};

export const tempPostKeyECDH = (keyStringPubToUse) => {
	return fetch(`https://${serverIP}:${serverPort}/temp-ecdh-key-from-client`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({clientPublicKey: keyStringPubToUse})
	});
}