/// api calls not meant for production, but useful for development and testing.
const serverIP = '192.168.0.113';
const serverPort = '3030';
//import crypto from 'crypto';

export const DecryptTestRSA = async (plainTextMessage, encryptedMessage) => {
	let response = await fetch(`https://${serverIP}:${serverPort}/decrypt-RSA-message-Test`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ plainTextMessage, encryptedMessage }),
	});
	if (response.ok) {
		return response.json();
	}
	else {
		console.error('Error in DecryptTestRSA: ', response.status);
		return response.status;
	}
}