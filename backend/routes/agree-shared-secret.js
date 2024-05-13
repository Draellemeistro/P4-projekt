const serverECDH = require('../utils/cryptoFunctions/serverECDH.js');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
	let responseValue;
	const reqBody = JSON.parse(req.body.msgForServer);
	let encryptedTestMessage = reqBody.encryptedMessage;
	let ivValue = reqBody.ivValue;
	let serverSharedSecret = await serverECDH.deriveSecret();
	let decryptedMessage = await serverECDH.handleEncryptedMessage(encryptedTestMessage, ivValue, serverSharedSecret);

	res.json({decryptedMessage: decryptedMessage}); //, maybe encrypt own public key for fun? encrypted:
});

module.exports = router;