const express = require('express');
const serverRSAcrypto = require('../utils/cryptoFunctions/serverRSA.js');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /rsa-msg endpoint');
	let encryptedMessage;
	if (typeof req.body.encrypted === 'string') {
		console.log('String detected');
		encryptedMessage = req.body.encrypted;
	} else {
		console.log('Object detected');
		encryptedMessage = req.body.encrypted;

	}
	console.log('Encrypted message: ', encryptedMessage);
	const decryptedMessage = await serverRSAcrypto.decryptRSA(encryptedMessage);
	if (decryptedMessage === req.body.message) {
		console.log('RSA Decryption successful');
	}
	console.log('Decrypted message: ', decryptedMessage);
	res.json({decryptedMessage: decryptedMessage});
});

module.exports = router;