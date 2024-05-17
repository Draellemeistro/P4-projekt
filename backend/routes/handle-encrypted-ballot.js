const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const { verifyToken } = require('../utils/jwt');
const { keyStore } = require('../utils/keyStore');
const router = express.Router();

router.post('/', async (req, res) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	const { message, signature } = req.body;
	const { encryptedMessage, ivValue} = JSON.parse(message);


	if (token == null) {
		console.log('No token');
		return res.sendStatus(401);
	}
	let decodedToken = verifyToken(token);
	let personId;
	if (!decodedToken) {
		console.log('Invalid token');
		res.status(409).json({ message: 'Invalid token' });
	} else {
		personId = decodedToken.personId;
		let keys = keyStore[personId];
		console.log('Keys:', keys)
		const ECDHKey = keys.ECDH;
		const DigSigKey = keys.DigSig;
		const verified = await serverDigSig.verify(message, signature, DigSigKey);
		if (verified) {
			console.log('Signature verified');
			console.log('DIGITAL SIGNATURES WORK\nDIGITAL SIGNATURES WORK\nDIGITAL SIGNATURES WORK\n');
		}
		else {
			console.log('Digital Signature verify returned false');
		}
		const decryptedMessage = await serverECDHCrypto.handleEncryptedMessage(
			encryptedMessage,
			ivValue,
			ECDHKey
		);
		console.log('Decrypted message:', decryptedMessage);
		const { innerLayer, voteId } = JSON.parse(decryptedMessage);

		if (decodedToken.voteId !== voteId) {
			console.log('voteId from token does not match voteId from decrypted message');
			res.status(409).json({ message: 'voteId mismatch' });
			return;
		}

		const insertQuery = 'INSERT INTO Agora.used_voteID (vote_id) VALUES (?)';
		const checkQuery = 'SELECT * FROM Agora.used_voteID WHERE vote_id = ?';
		const ballotQuery = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
		connection.query(checkQuery, [voteId], (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				res.status(500).json({ message: 'Internal server error' });
				return;
			}
			if (result.length === 0) { // voteID does not exist
				connection.query(insertQuery, [voteId], (err) => {
					if (err) {
						console.error('Error executing query:', err);
						res.status(500).json({ message: 'Internal server error' });
					} else {
						console.log('VoteID inserted into database');
						connection.query(ballotQuery, [innerLayer], (err, result) => {
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
				console.log('VoteID already exists');
				res.status(409).json({ message: 'VoteID already exists' });
			}
		});

	}
});

module.exports = router;