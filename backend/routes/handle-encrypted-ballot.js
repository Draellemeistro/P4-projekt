const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const { verifyToken } = require('../utils/jwt');
const router = express.Router();

router.post('/', async (req, res) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	const { message, signature } = req.body;
	const { encryptedMessage, ivValue, clientPubKey } = JSON.parse(message);

	if (token == null) return res.sendStatus(401); // if there isn't any token
	if (verifyToken(token)) {
		const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(
			encryptedMessage,
			ivValue,
			clientPubKey
		);

		const { voteID } = JSON.parse(decryptedMessage);
		const query = 'INSERT IGNORE INTO Agora.used_voteID (vote_id) VALUES (?)';
		connection.query(query, [voteID], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				res.status(500).json({ message: 'Internal server error' });
				return;
			}

			if (result.affectedRows === 0) {
				console.log('VoteID already exists in the database');
				res.status(409).json({ message: 'VoteID already exists in the database' });
				return;
			}

			console.log('VoteID inserted into database');
			const query = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
			connection.query(query, [decryptedMessage.InnerLayer], (err, result) => {
				if (err) {
					console.error('Error executing query:', err);
					res.status(500).json({ message: 'Internal server error' });
					return;
				}

				if (result.affectedRows === 0) {
					console.log('Error Encrypted ballot not inserted into database');
					res.status(500).json({ message: 'Error Encrypted ballot not inserted into database' });
					return;
				}

				console.log('Encrypted ballot inserted into database');
				res.status(200).json({ message: 'Encrypted ballot inserted into database' });
			});
		});
	}
});

module.exports = router;