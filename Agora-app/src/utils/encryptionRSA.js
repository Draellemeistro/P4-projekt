const crypto = require('crypto');
import axios from 'axios'; // You'll need to install axios using npm install axios


const RSACrypto = {

	request: async function requestPublicKey() {
		const response = await axios.get('http://130.225.39.205:3366/rsa-public-key');
		sessionStorage.setItem('serverPublicKeyRSA', response.data);
	},
	encrypt: function encryptWithPublicKey(message, publicKey) {
		const buffer = Buffer.from(message, 'utf8');
		const encrypted = crypto.publicEncrypt(publicKey, buffer);
		return encrypted.toString('base64');
	},

};
export default RSACrypto;