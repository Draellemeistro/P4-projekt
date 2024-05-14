const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const router = express.Router();



router.post('/', async (req, res) => {
	const message = req.body.message;
	const messageObject = JSON.parse(message);
	const signature = req.body.signature;

	// ballot can be stored even before first round of decryption. Could save them for later use?
	const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(
		messageObject.encryptedMessage,
		messageObject.ivValue,
		messageObject.clientPubKey//serverECDHCrypto.clientPubKey
	);

	let voteID;
	let voteIdEligible = false;
	let otherInformation;
	let subMessageObject;
	console.log('Decrypted message:', decryptedMessage);
	// TODO do something to utilize the otherInformation object (VoteID, etc.)
	if (typeof decryptedMessage === 'string') {
		 subMessageObject = JSON.parse(decryptedMessage);
	}
	if (typeof  messageObject.otherInformation === 'string') {
		otherInformation = JSON.parse(subMessageObject.otherInformation);
	} else {
		otherInformation = messageObject.otherInformation;
	}
	voteID = otherInformation.voteID;

	// TODO: Use vote ID to get the correct clientKey to verify the signature.
	const verify = await serverDigSig.verifyReceivedMessage(signature, req.body.message);
	if(verify){
		console.log('Signature is valid');
		// TODO: compare the voteID with the database to ensure it is eligible to vote.
		voteIdEligible = await checkVoteID(voteID);
		if(typeof subMessageObject.innerLayer === 'string') {
			const encBallot = JSON.parse(subMessageObject.innerLayer);
			console.log('Encrypted Ballot:', encBallot);
		}
		const encBallot = subMessageObject.innerLayer;
		if (voteIdEligible) {
			console.log('Vote ID is eligible');
			const receipt = await serverDigSig.prepareSignatureToSend(subMessageObject.innerLayer);
			console.log('Receipt:', receipt);
			console.log('Encrypted Ballot:', encBallot);
			}
		//TODO: save hash of voteID+publicKey to database???
	}

//

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
async function checkVoteID(voteId)	{
	if(voteId)
		return true;
}

async function storeAcceptedBallot(encBallot, receipt){
	const query = 'INSERT INTO Agora.ballotbox (encr_ballot, receipt) VALUES (?, ?)';
	connection.query(query, [encBallot, receipt], (err, results) => {
		if (err) {
			console.error(err);
			console.error('Error inserting data into database');
			return false;
		} else {
			return true; //what would results be?
		}
	});
}
module.exports = router;
