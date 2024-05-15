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

		const voteID = JSON.parse(decryptedMessage).voteId;
		const innerlayer = JSON.parse(decryptedMessage).InnerLayer;
		console.log('VoteID:', voteID);
		console.log('Decrypted message:', decryptedMessage.InnerLayer);

		const query = 'INSERT INTO Agora.used_voteID (vote_id) VALUES (?)';
		const checkQuery = 'SELECT * FROM Agora.used_voteID WHERE vote_id = ?';
		connection.query(checkQuery, [voteID], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				res.status(500).json({ message: 'Internal server error' });
				return;
			}
			if (result.length === 0) { // voteID does not exist
				const insertQuery = 'INSERT INTO Agora.used_voteID (vote_id) VALUES (?)';
				connection.query(insertQuery, [voteID], (err, result) => {
					if (err) {
						console.error('Error executing query:', err);
						res.status(500).json({ message: 'Internal server error' });
						return;
					}else{
						console.log('VoteID inserted into database');
						const query = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
						connection.query(query, [innerlayer], (err, result) => {
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
					}
				});
			} else {
				console.log('VoteID already exists in the database');
				res.status(409).json({ message: 'VoteID already exists in the database' });
			}
		});
	}
});

module.exports = router;