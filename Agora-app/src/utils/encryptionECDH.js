//import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';


export const initECDH = () => {
	return window.crypto.subtle.generateKey(
		{
			name: "ECDH",
			namedCurve: "P-521"
		},
		true,
		["deriveKey", "deriveBits"]
	).then(function(keyPair){
		// Returns the public and private keys
		console.log(keyPair.publicKey);
		console.log(keyPair.privateKey);
	}).catch(function(err){
		console.error(err);
	});
};

// Function to get client's public key
export const getPublicKey = (clientKeys) => {
	return clientKeys.getPublicKey().toString('base64');
}

// Function to compute shared secret
export const computeSharedSecret = (client, serverpubkeyBase64string) => {
	//let serverPublicKeyBase64 = sessionStorage.getItem('serverPublicKeyECDH');
	return client.computeSecret(serverpubkeyBase64string, 'base64', 'hex');
}


// Function to send client's public key and receive server's public key
export const requestServerPublicKeyECDH = () => {
	const response = axios.get('https://130.225.39.205:3030/request-public-ecdh-key');
	sessionStorage.setItem('serverPublicKeyECDH', response.data);
	return response.data;
}
export const encryptMessageECDH = (Message, sharedSecret) => {
	const cipher = crypto.createCipher('aes-256-cbc', sharedSecret);
	let encrypted = cipher.update(Message, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}


// Function to perform ECDH key exchange, encrypt ballot, and send it to server
export const performECDHAndEncryptBallot = async (ballot,client, clientKeys) => {
	const clientPublicKeyBase64 = getPublicKey(clientKeys);
	const serverPublicKeyBase64 = await requestServerPublicKeyECDH(clientPublicKeyBase64);
	const sharedSecret = computeSharedSecret(serverPublicKeyBase64);
	return encryptMessageECDH(ballot, sharedSecret);
}
export const verifyTestSharedSecret = (clientSharedSecret, clientPublicKeyBase64) => {
	return fetch('https://130.225.39.205:3030/check-shared-secret', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			sharedSecret: clientSharedSecret,
			clientPublicKey: clientPublicKeyBase64
		})
	}).then(response => response.json());
}

//export const performTestECDHAndEncryptBallot = (ballot) => {
//	// eslint-disable-next-line no-unused-vars
//	const {client, clientKeys}= initECDH();
//	//const clientPublicKeyBase64 = getPublicKey(clientKeys);
//	const serverPublicKeyECDH = fs.readFileSync('./serverPublicKeyECDH.pem', 'utf8');
//	const serverPublicKeyBase64 = serverPublicKeyECDH.toString();
//	const sharedSecret = computeSharedSecret(client, serverPublicKeyBase64);
//	return encryptMessageECDH(ballot, sharedSecret);
//}
//let ballot = 'Alice';
//let {encrypted_ballot, sharedSecret} = performTestECDHAndEncryptBallot(ballot);
//console.log(encrypted_ballot, sharedSecret);
