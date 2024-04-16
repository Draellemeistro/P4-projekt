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
export const sendBallotToServer = async (ballot, rsaKey) => {
	const response = await fetch('http://20.79.40.89:80/insert-ballot', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ rsaKey, ballot })
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}