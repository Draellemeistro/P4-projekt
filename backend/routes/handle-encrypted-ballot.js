const express = require('express');
const db = require('../utils/db.js');
const crypto = require('../utils/cryptoFunctions/serverECDH.js');
const digSig = require('../utils/cryptoFunctions/serverDigSig');
const jwt = require('../utils/jwt');
const { keyStore } = require('../utils/keyStore');
const cryptoUtils = require('../utils/cryptoFunctions/serverCryptoUtils');
const router = express.Router();

function sendResponse(res, statusCode, message) {
	res.status(statusCode).json({ message });
}

function checkVoteIdToken(tokenVoteId, voteId) {
	return tokenVoteId === voteId;
}

function compareVoteIdDB(voteId, hashedFetchedVoteId) {
	return voteId === hashedFetchedVoteId;
}

async function handleEncryptedBallot(req) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	const { message, signature } = req.body;
	const { encryptedMessage, ivValue} = JSON.parse(message);

	let decodedToken = jwt.verifyToken(token);
	if (!decodedToken) {
		throw new Error('Invalid token');
	}

	let personId = decodedToken.personId;
	let keys = keyStore[personId];
	if (!keys) {
		throw new Error('No keys found for personId: ' + personId);
	}
	const ECDHKey = keys.ECDH;
	const DigSigKey = keys.DigSig;

	const verified = await digSig.verify(message, signature, DigSigKey);
	if (!verified) {
		throw new Error('Digital Signature verify returned false');
	}

	const decryptedMessage = await crypto.handleEncryptedMessage(
		encryptedMessage,
		ivValue,
		ECDHKey
	);
	const { innerLayer, voteId, salt, ID } = JSON.parse(decryptedMessage);

	const voteIDTokenMatch = checkVoteIdToken(decodedToken.voteId, voteId);
	if (!voteIDTokenMatch) {
		throw new Error('voteId mismatch');
	}

	const voteStatus = await db.checkVoteStatus(ID);
	if (!voteStatus) {
		throw new Error('VoteID does not exist or has already voted');
	}

	const fetchedVoteId = await db.getVoteId(ID);

	const hashedFetchedVoteId = await cryptoUtils.hashString({ voteId: fetchedVoteId, salt: salt });

	const voteIdDBMatch = compareVoteIdDB(voteId, hashedFetchedVoteId);
	if (!voteIdDBMatch) {
		throw new Error('voteId mismatch');
	}

	const updateStatus = await db.updateVoteStatus(ID);
	if (!updateStatus) {
		throw new Error('Failed to update vote status');
	}

	const insertStatus = await db.insertEncryptedBallot(innerLayer);
	if (!insertStatus) {
		throw new Error('Failed to insert encrypted ballot');
	}

	return 'Encrypted ballot inserted into database';
}

router.post('/', async (req, res) => {
	try {
		const message = await handleEncryptedBallot(req);
		sendResponse(res, 200, message);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred' });
	}
});

module.exports = router;