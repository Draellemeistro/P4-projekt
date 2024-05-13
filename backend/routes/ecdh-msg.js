const express = require('express');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /ecdh-msg endpoint');
	let detailsObj;
	if (typeof req.body.msgForServer === 'string') {
		console.log('String detected');
		detailsObj = JSON.parse(req.body.msgForServer);
	} else {
		detailsObj = req.body.msgForServer;
	}
	const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(detailsObj.encryptedMessage, detailsObj.ivValue, serverECDHCrypto.clientPubKey);
	console.log('Decrypted message: ', decryptedMessage);
	res.json({decryptedMessage: decryptedMessage});
});

module.exports = router;