//const crypto = require('crypto');
//const { readFileSync } = require('fs');
//const publicKey = readFileSync('Agora-app/static/server_id_rsa_pub.pem', 'utf8');
//const ballot = readFileSync('Agora-app/static/', 'utf8');
// eslint-disable-next-line no-unused-vars
//const encryptedBallot = encryptBallot(ballot, publicKey);
/*
function encryptBallot(ballot, publicKey) {

	return crypto.publicEncrypt(publicKey, Buffer.from(ballot)).toString('base64');
}
*/
/* export async function sendDataToServer(data) {
	const response = await fetch('/api/insert', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
} */
export const sendBallotToServer = async (ballot) => {
	const serverIP = '130.225.39.205';
	const serverPort = '443';
	// TODO implement ECDH key exchange from utils folder
	const clientPubKeyECDH = 'test';
	const response = await fetch(`https://${serverIP}:${serverPort}/insert-ballot`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ clientPubKeyECDH, ballot })
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}
function getCandidatesFromServer() {
	return fetch('/fetch-candidates')
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			//console.log(data);
			return data;
		})
		.catch(error => {
			// Handle any errors that occurred while fetching the candidates
			console.error('Error:', error);
		});
}
module.exports = { getCandidatesFromServer, sendBallotToServer };