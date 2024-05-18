const express = require('express');
const db = require('../utils/db.js');
const crypto = require('../utils/cryptoFunctions/serverECDH.js');
const digSig = require('../utils/cryptoFunctions/serverDigSig');
const jwt = require('../utils/jwt');
const keyStore = require('../utils/keyStore');
const cryptoUtils = require('../utils/cryptoFunctions/serverCryptoUtils');
const router = express.Router();

const STATUS_CODES = {
	INVALID_TOKEN: 409,
	VOTE_ID_MISMATCH: 409,
	VOTE_ID_NOT_EXIST: 409,
	UPDATE_FAILED: 500,
	INSERT_FAILED: 500,
	SUCCESS: 200
};

const MESSAGES = {
	INVALID_TOKEN: 'Invalid token',
	VOTE_ID_MISMATCH: 'voteId mismatch',
	VOTE_ID_NOT_EXIST: 'VoteID does not exist or has already voted',
	UPDATE_FAILED: 'Failed to update vote status',
	INSERT_FAILED: 'Failed to insert encrypted ballot',
	SUCCESS: 'Encrypted ballot inserted into database'
};

function sendResponse(res, statusCode, message) {
	res.status(statusCode).json({ message });
}

router.post('/', async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const { message, signature } = req.body;
		const { encryptedMessage, ivValue} = JSON.parse(message);

		let decodedToken = jwt.verifyToken(token);
		if (!decodedToken) {
			return sendResponse(res, STATUS_CODES.INVALID_TOKEN, MESSAGES.INVALID_TOKEN);
		}

		let personId = decodedToken.personId;
		let keys = keyStore[personId];
		const ECDHKey = keys.ECDH;
		const DigSigKey = keys.DigSig;

		const verified = await digSig.verify(message, signature, DigSigKey);
		if (!verified) {
			console.log('Digital Signature verify returned false');
			return;
		}

		const decryptedMessage = await crypto.handleEncryptedMessage(
			encryptedMessage,
			ivValue,
			ECDHKey
		);
		const { innerLayer, voteId, salt, ID } = JSON.parse(decryptedMessage);

		const voteIDTokenMatch = cryptoUtils.checkVoteId(decodedToken.voteId, voteId);
		if (!voteIDTokenMatch) {
			return sendResponse(res, STATUS_CODES.VOTE_ID_MISMATCH, MESSAGES.VOTE_ID_MISMATCH);
		}

		const voteStatus = await db.checkVoteStatus(ID);
		if (!voteStatus) {
			return sendResponse(res, STATUS_CODES.VOTE_ID_NOT_EXIST, MESSAGES.VOTE_ID_NOT_EXIST);
		}

		const voteIdMatch = await cryptoUtils.compareVoteId(voteId, hashedFetchedVoteId);
		if (!voteIdMatch) {
			return sendResponse(res, STATUS_CODES.VOTE_ID_MISMATCH, MESSAGES.VOTE_ID_MISMATCH);
		}

		const updateStatus = await db.updateVoteStatus(ID);
		if (!updateStatus) {
			return sendResponse(res, STATUS_CODES.UPDATE_FAILED, MESSAGES.UPDATE_FAILED);
		}

		const insertStatus = await db.insertEncryptedBallot(innerLayer);
		if (!insertStatus) {
			return sendResponse(res, STATUS_CODES.INSERT_FAILED, MESSAGES.INSERT_FAILED);
		}

		sendResponse(res, STATUS_CODES.SUCCESS, MESSAGES.SUCCESS);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'An error occurred' });
	}
});

module.exports = router;