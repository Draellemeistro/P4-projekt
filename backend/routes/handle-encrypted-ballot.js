import express from 'express';
import serverECDHCrypto from '../utils/cryptoFunctions/serverECDH.cjs';
const router = express.Router();
import connection from '../utils/db.js';



router.post('/', async (req, res) => {
	let encBallot = req.body.encryptedSubLayer;
	let clientKeyPub = req.body.clientKeyPub;
	const ivValue = req.body.ivValue;
	let sharedSecret = await serverECDHCrypto.deriveSharedSecret(serverECDHCrypto.serverPubKeyJWK, clientKeyPub);
	let decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(encBallot, ivValue, sharedSecret);
	//TODO: do some handling of decrypted layers data.
	if (typeof decryptedMessage === 'string') {
		decryptedMessage = JSON.parse(decryptedMessage);
	}
	try {
		console.log('Original message:', encBallot);
		console.log('Decrypted message:', decryptedMessage);
		//Object.keys(decryptedMessage).forEach(key => {
		//});
	} catch (error) {
		console.error('Error:', error);
	}
	if (typeof encBallot !== 'string') {
		encBallot = JSON.stringify(encBallot);
	}
	if (typeof clientKeyPub !== 'string') {
		clientKeyPub = JSON.stringify(clientKeyPub);
	}

	/// TODO: do we want this? ballot should be storable even before first round of decryption. Could save them for later use?
	let ivArray = Object.values(ivValue);
	let ivHexString = ivArray.map(byte => byte.toString().padStart(2, '0')).join(''); // haven't tested thoroughly. Convert the IV to a hex string, for storage in the database
	const query = 'INSERT INTO Agora.ballotbox (encr_ballot, ECDH_pub_key, iv_value) VALUES (?, ?, ?)';
	connection.query(query, [encBallot, clientKeyPub, ivHexString], (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});
	export default router;
