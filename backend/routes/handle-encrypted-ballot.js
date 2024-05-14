const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const router = express.Router();



router.post('/', async (req, res) => {
	const messageObject = JSON.parse(req.body.message);
	const signature = req.body.signature;
	const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(
		messageObject.encryptedMessage,
		messageObject.ivValue,
		messageObject.clientPubKey//serverECDHCrypto.clientPubKey
	);
	console.log('Decrypted message:', decryptedMessage);


	const verify = await serverDigSig.verifyReceivedMessage(signature, req.body.message);
	if(verify){
		console.log('Signature is valid');
		console.log('Decrypted message type:', typeof decryptedMessage);

	}
	//
	////TODO: do some handling of decrypted layers data.
	//if (typeof decryptedMessage === 'string') {
	//	decryptedMessage = JSON.parse(decryptedMessage);
	//}
	//try {
	//	console.log('Original message:', encBallot);
	//	console.log('Decrypted message:', decryptedMessage);
	//	//Object.keys(decryptedMessage).forEach(key => {
	//	//});
	//} catch (error) {
	//	console.error('Error:', error);
	//}
	//if (typeof encBallot !== 'string') {
	//	encBallot = JSON.stringify(encBallot);
	//}
	//if (typeof clientKeyPub !== 'string') {
	//	clientKeyPub = JSON.stringify(clientKeyPub);
	//}
//
	///// TODO: do we want this? ballot should be storable even before first round of decryption. Could save them for later use?
	//let ivArray = Object.values(ivValue);
	//let ivHexString = ivArray.map(byte => byte.toString().padStart(2, '0')).join(''); // haven't tested thoroughly. Convert the IV to a hex string, for storage in the database
	//const query = 'INSERT INTO Agora.ballotbox (encr_ballot, ECDH_pub_key, iv_value) VALUES (?, ?, ?)';
	//connection.query(query, [encBallot, clientKeyPub, ivHexString], (err, results) => {
	//	if (err) {
	//		console.error(err);
	//		res.status(500).send('Error inserting data into database');
	//	} else {
	//		res.json({ message: 'Data inserted successfully', results });
	//	}
	//});
});
module.exports = router;