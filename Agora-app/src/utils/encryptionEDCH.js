const crypto = require('crypto');
import axios from 'axios'; // You'll need to install axios using npm install axios
const client = crypto.createECDH('secp521r1');
const clientKeys = client.generateKeys();

// Function to get client's public key
function getPublicKey(clientKeys) {
	return clientKeys.getPublicKey().toString('base64');
}

// Function to compute shared secret
function computeSharedSecret() {
	let serverPublicKeyBase64 = sessionStorage.getItem('serverPublicKeyECDH');
	return client.computeSecret(serverPublicKeyBase64, 'base64', 'hex');
}


// Function to send client's public key and receive server's public key
function requestServerPublicKeyECDH () {
	const response = axios.get('http://130.225.39.205:3366/request-public-ecdh-key');
	sessionStorage.setItem('serverPublicKeyECDH', response.data);
}
function encryptMessageECDH(Message, sharedSecret) {
	const cipher = crypto.createCipher('aes-256-cbc', sharedSecret);
	let encrypted = cipher.update(Message, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}


// Function to perform ECDH key exchange, encrypt ballot, and send it to server
async function performECDHAndEncryptBallot(ballot) {
	const clientPublicKeyBase64 = getPublicKey(clientKeys);
	const serverPublicKeyBase64 = await requestServerPublicKeyECDH(clientPublicKeyBase64);
	const sharedSecret = computeSharedSecret(serverPublicKeyBase64);
	return encryptMessageECDH(ballot, sharedSecret);
}

module.exports = { getPublicKey, computeSharedSecret, requestServerPublicKeyECDH, encryptMessage: encryptMessageECDH, performECDHAndEncryptBallot };