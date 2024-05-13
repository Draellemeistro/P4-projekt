const express = require('express');
const serverRSAcrypto = require('../utils/cryptoFunctions/serverRSA.js');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /rsa-msg endpoint');
	if (typeof req.body.encrypted === 'string') {
		console.log('String detected');
	} else {
		console.log('Object detected');
	}
	const decryptedMessage = await serverRSAcrypto.decryptRSA(req.body.encrypted);
	if (decryptedMessage === req.body.message) {
		console.log('RSA Decryption successful');
	}
	console.log('Decrypted message: ', decryptedMessage);
	res.json({decryptedMessage: decryptedMessage});
});

module.exports = router;