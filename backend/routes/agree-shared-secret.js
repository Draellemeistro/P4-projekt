import serverECDHCrypto from '../utils/cryptoFunctions/serverECDH.js';
import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
	let responseValue;
	let clientPubECDHJWK = req.body.clientPublicKey;
	let serverPrivECDHJWK = JSON.parse(stringJWKServerPrivECDH);
	let serverSharedSecret;
	let encryptedTestMessage;
	let ivValue;
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(serverPrivECDHJWK, clientPubECDHJWK);
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encryptedTestMessage, ivValue, sharedSecret);

	if (decryptedMessage === JSON.stringify(clientPubECDHJWK)) {
		responseValue = true;
	} else{
		responseValue = decryptedMessage === clientPubECDHJWK;
	}

	res.json({success: responseValue}); //, maybe encrypt own public key for fun? encrypted:
});

export default router;