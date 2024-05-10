import serverECDH from '../utils/cryptoFunctions/serverECDH.cjs';
import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
	let responseValue;
	let clientPubECDHJWK = req.body.clientPublicKey;

	let encryptedTestMessage = req.body.encryptedMessage;
	let ivValue = req.body.ivValue;
	let serverSharedSecret = await serverECDH.deriveSharedSecret(clientPubECDHJWK);
	let decryptedMessage = await serverECDH.handleEncryptedMessage(encryptedTestMessage, ivValue, serverSharedSecret);

	if (decryptedMessage === JSON.stringify(clientPubECDHJWK)) {
		responseValue = true;
	} else{
		responseValue = decryptedMessage === clientPubECDHJWK;
	}

	res.json({success: responseValue}); //, maybe encrypt own public key for fun? encrypted:
});

export default router;