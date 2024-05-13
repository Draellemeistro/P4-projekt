const serverECDH = require('../utils/cryptoFunctions/serverECDH.js');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
	const reqBody = JSON.parse(req.body.msgForServer);
	let encryptedTestMessage = reqBody.encryptedMessage;
	const responsePlainText = 'This is a test message from the server';
	let ivValue = reqBody.ivValue;
	let decryptedMessage = await serverECDH.handleEncryptedMessage(encryptedTestMessage, ivValue);
	console.log('decrypted ECDH: ', decryptedMessage);
	// extra for fun

	res.json({decryptedMessage: decryptedMessage}); //, maybe encrypt own public key for fun? encrypted:
});

module.exports = router;