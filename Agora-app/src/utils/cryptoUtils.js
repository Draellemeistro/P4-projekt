/**
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey#rsa_key_pair_generation
 */
import crypto from 'crypto';
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
const serverIP = '192.168.0.113';
const 	serverPort = '3030';

const cryptoUtils = {
	arrayBufferToString: function(buffer) {
		return new TextDecoder().decode(new Uint8Array(buffer));
	},
	stringToByteString: function(str) {
		return new Uint8Array(str);
	},
	byteStringToString: function(byteString) {
		return String.fromCharCode.apply(null, byteString);
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
	},
	bytesToIntegerBigEndian: function(bytes) {
		let result = 0;
		for (let i = 0; i < bytes.length; i++) {
			result = result * 256 + bytes[i];
		}
		return result;
	},
	integerToBytesBigEndian: function(integer, length) {
		let result = [];
		for (let i = 0; i < length; i++) {
			result.push(integer >> (8 * (length - i - 1)) & 0xFF);
		}
		return result;
	},
	randomIntegerUniform: function(min, max) {
		let range = max - min + 1;
		let bytes = window.crypto.getRandomValues(new Uint8Array(4));
		let value = this.bytesToIntegerBigEndian(bytes);
		return min + value % range;
	},
	bitLength: function(n) {
		return Math.floor(Math.log2(n)) + 1;
	},
	inverseMod: function(a, n) {
		let t = 0, newt = 1;
		let r = n, newr = a;
		while (newr !== 0) {
			let quotient = Math.floor(r / newr);
			[t, newt] = [newt, t - quotient * newt];
			[r, newr] = [newr, r - quotient * newr];
		}
		if (r > 1) {
			throw new Error('a is not invertible');
		}
		if (t < 0) {
			t += n;
		}
		return t;
	},
	isCoprime: function(a, n) {
		while (n !== 0) {
			[a, n] = [n, a % n];
		}
		return a === 1;
	},
	lengthOfStringInBytes: function(n) {
		return Math.ceil(this.bitLength(n) / 8);
	},
	random: function(n) { // generate n random bytes
		return window.crypto.getRandomValues(new Uint8Array(n));
	},
	concatenate: function(...arrays) {
		let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
		let result = new Uint8Array(totalLength);
		let offset = 0;
		let resultMaybe = new Uint8Array(totalLength);
		for (let arr of arrays) {
			resultMaybe.concat(arr);
			result.set(arr, offset);
			offset += arr.length;
		}
		if (resultMaybe.length !== totalLength) {
			throw new Error('Concatenation failed');
		} else if (resultMaybe === result) {
			return resultMaybe;
		}else	return result;
	},
	slice: function(array, start, end) {
		return array.slice(start, end);
	},


};

const messageEncryption= {
	sendEncryptedBallot: async function(encryptedBallot, clientPublicKeyBase64,EncryptedVoter) {
		const response = await axios.post(`https://${serverIP}:${serverPort}/insert-ballot`, {
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
};

export default cryptoUtils;
export { messageEncryption };