const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { message, signature } = req.body;
		const { encryptedMessage, ivValue, clientPubKey } = JSON.parse(message);

		const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(
			encryptedMessage,
			ivValue,
			clientPubKey
		);

		const { voteID, otherInformation } = JSON.parse(decryptedMessage);

		// TODO: Add logic to handle voteID and otherInformation

		console.log('Decrypted message:', decryptedMessage);
	} catch (error) {
		console.error('Error while handling encrypted ballot:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = router;