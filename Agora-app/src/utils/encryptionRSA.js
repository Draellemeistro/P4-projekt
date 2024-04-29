import crypto from 'crypto';
import axios from 'axios'; // You'll need to install axios using npm install axios


const RSACrypto = {
	request: async function requestPublicKey() {
		const serverIP = '192.168.0.113';
		const 	serverPort = '3000';
		const response = await axios.get(`http://${serverIP}:${serverPort}/rsa-public-key`);
		sessionStorage.setItem('serverPublicKeyRSA', response.data);
		return response.data;
	},
	encrypt: function encryptWithPublicKey(message, publicKey) {
		const buffer = Buffer.from(message, 'utf8');
		const encrypted = crypto.publicEncrypt(publicKey, buffer);
		return encrypted.toString('base64');
	},
	decrypt: function decryptWithPrivateKey(encryptedMessage, privateKey) {
		const buffer = Buffer.from(encryptedMessage, 'base64');
		const decrypted = crypto.privateDecrypt(privateKey, buffer);
		return decrypted.toString('utf8');
	},

};

export default RSACrypto;