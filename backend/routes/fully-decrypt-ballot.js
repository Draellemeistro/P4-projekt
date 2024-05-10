const express = require('express');
const serverRSACrypto = require('../utils/cryptoFunctions/serverRSA.cjs');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const router = express.Router();



router.post('/', async (req, res) => {
	console.log('Accessed /rsa-to-ecdh-test endpoint');
	const plainTextMessage = req.body.plaintext;
	const midwayMessage = req.body.midWayEncrypted;
	const encryptedMessage = req.body.OutgoingEncrypted;
	const clientPubKey = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;

	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(stringJWKServerPrivECDH, clientPubKey);
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedMessage, ivValue, sharedSecret);
	if (decryptedMessage === midwayMessage) {
		console.log('ECDH upper layer works!');
	}
	let decryptedMidWayMsg = serverRSACrypto.decryptWithPrivRSA(decryptedMessage, pemFormatServerPrivateRSAKey);
	if (decryptedMidWayMsg === plainTextMessage) {
		console.log('RSA to ECDH works!');
	}
	res.json(decryptedMessage);
});

module.exports = router;