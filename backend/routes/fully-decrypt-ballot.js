const express = require('express');
const serverRSACrypto = require('../utils/cryptoFunctions/serverRSA.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const router = express.Router();



router.post('/', async (req, res) => {
	console.log('Accessed /rsa-to-ecdh-test endpoint');
	const plainTextMessage = req.body.plaintext;
	const midwayMessage = req.body.midWayEncrypted;
	const encryptedMessage = req.body.OutgoingEncrypted;
	const clientPubKey = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;

	let sharedSecret = await serverECDHCrypto.deriveSecret();
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, clientPubKey);
	if (decryptedMessage === midwayMessage) {
		console.log('ECDH upper layer works!');
	}
	let decryptedMidWayMsg = serverRSACrypto.decryptRSA(decryptedMessage);
	if (decryptedMidWayMsg === plainTextMessage) {
		console.log('RSA to ECDH works!');
	}
	res.json(decryptedMessage);
});

module.exports = router;