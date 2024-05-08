import express from 'express';
import serverECDHCrypto from '../utils/cryptoFunctions/serverECDH.js';
const router = express.Router();
import connection from '../utils/db.js';



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

export default router;