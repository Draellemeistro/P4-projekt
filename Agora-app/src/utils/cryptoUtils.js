/**
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#rsa_key_pair_generation
 */
const crypto = require('crypto');
import axios from 'axios'; // You'll need to install axios using npm install axios
import RSACrypto from './encryptionRSA.js';
// eslint-disable-next-line no-unused-vars
const client = crypto.createECDH('secp521r1');
const clientKeys = client.generateKeys();
// eslint-disable-next-line no-unused-vars
const { getPublicKey, computeSharedSecret, requestServerPublicKeyECDH, encryptMessageECDH, performECDHAndEncryptBallot } = require('./encryptionECDH');
//  ----- ECDH -----
// Generate client's keys
// Function to send encrypted ballot to server


const cryptoUtils = {
	arrayBufferToString: function(buffer) {
		return new TextDecoder().decode(new Uint8Array(buffer));
	},

	sendEncryptedBallot: async function(encryptedBallot, clientPublicKeyBase64,EncryptedVoter) {
		const response = await axios.post('http://20.79.40.89:80/insert-ballot', {
			ballot: encryptedBallot,
			voter: EncryptedVoter,
			pubKeyECDH: clientPublicKeyBase64// Assuming you're using the client's public key as the RSA key
		});

		if (response.status !== 200) {
			throw new Error('Failed to send encrypted ballot');
		}

		return response.data;
	},

	encryptWithRSAThenECDH: async function(ballot, voter) {
		await RSACrypto.request();
		const publicKey = sessionStorage.getItem('serverPublicKeyRSA');
		let encryptedBallotLayerOne = RSACrypto.encrypt(ballot, publicKey);
		await requestServerPublicKeyECDH();
		const sharedSecret = computeSharedSecret();
		let encryptedBallotLayerTwo = encryptMessageECDH(encryptedBallotLayerOne, sharedSecret);
		let encryptedVoter = encryptMessageECDH(voter, sharedSecret);
		return await this.sendEncryptedBallot(encryptedBallotLayerTwo, getPublicKey(clientKeys), encryptedVoter);
	},

	encryptWithECDHThenRSA: async function(ballot, voter) {
		await requestServerPublicKeyECDH();
		const sharedSecret = computeSharedSecret();
		let encryptedBallotLayerOne = encryptMessageECDH(ballot, sharedSecret);
		await RSACrypto.request();
		const publicKey = sessionStorage.getItem('serverPublicKeyRSA');
		let encryptedBallotLayerTwo = RSACrypto.encrypt(encryptedBallotLayerOne, publicKey);
		let encryptedVoter = RSACrypto.encrypt(voter, publicKey);
		return await this.sendEncryptedBallot(encryptedBallotLayerTwo, getPublicKey(clientKeys), encryptedVoter);
	},

	stringToArrayBuffer: function(str) {
		return new TextEncoder().encode(str);
	},

	arrayBufferToBase64: function(buffer) {
		let binary = '';
		let bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	},

	base64ToArrayBuffer: function(base64) {
		let binary_string = window.atob(base64);
		let len = binary_string.length;
		let bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
};

export default cryptoUtils;