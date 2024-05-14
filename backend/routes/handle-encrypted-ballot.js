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
	if (typeof subMessageObject.otherInformation === 'string') {
		otherInformation = JSON.parse(subMessageObject.otherInformation);

	} else {
		otherInformation = subMessageObject.otherInformation;
	}
	voteID = otherInformation.voteID;

	// TODO: Use vote ID to get the correct clientKey to verify the signature.
	const verify = await serverDigSig.verifyReceivedMessage(signature, message);
	if (verify) {
		console.log('Signature is valid');
		// TODO: compare the voteID with the database to ensure it is eligible to vote.
		voteIdEligible = await checkVoteID(voteID);
		if (voteIdEligible) {
			console.log('Vote ID is eligible');
			const encBallot = subMessageObject.InnerLayer;
			const receipt = await serverDigSig.prepareSignatureToSend(encBallot);
			const responseDB = await storeAcceptedBallot(encBallot, receipt);
			if (responseDB) {
				console.log('Ballot stored successfully');
			}
			//TODO: save hash of voteID+publicKey to database???
		} // TODO: check DB stuff

	}
	const responseSignature = await serverDigSig.prepareSignatureToSend(message);
	res.json({message: message, signature: responseSignature});
});

async function checkVoteID(voteId)	{
	if(voteId)
		return true;
}


async function storeAcceptedBallot(encBallot, receipt) {
	const query = 'INSERT INTO Agora.ballotbox (encr_ballot, receipt) VALUES (?, ?)';
	return connection.query(query, [encBallot, receipt], (err) => {
			if (err) {
				console.error(err);
				console.error('Error inserting data into database');
			}
			return true;
		}
	);
}


module.exports = router;

//function logObjectEntriesWithType(obj) {
//	if(typeof obj !== 'object') {
//		console.log('Invalid object');
//		return;
//	}
//	for (const [key, value] of Object.entries(obj)) {
//		console.log(`Key: ${key}, Value: ${value}, Type: ${typeof value}`);
//	}
//}