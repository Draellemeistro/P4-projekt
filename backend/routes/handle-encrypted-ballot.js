const express = require('express');
const connection = require('../utils/db.js');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH.js');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig');
const { verifyToken } = require('../utils/jwt');
const { keyStore } = require('../utils/keyStore');
const { hashString } = require('../utils/cryptoFunctions/serverCryptoUtils');
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
		const { innerLayer, voteId, salt, ID } = JSON.parse(decryptedMessage);
		console.log('ID:', ID);
		if (decodedToken.voteId !== voteId) {
			console.log('voteId from token does not match voteId from decrypted message');
			res.status(409).json({ message: 'voteId mismatch' });
			return;
		}
		const checkQuery = 'SELECT * FROM Agora.votes WHERE id = ?';
		const updateQuery = 'UPDATE Agora.votes SET hasVoted = true WHERE id = ?';
		const ballotQuery = 'INSERT INTO Agora.ballotbox (encr_ballot) VALUES (?)';
		const fetchVoteIdQuery = 'SELECT VoteID FROM Agora.votes WHERE id = ?';

		connection.query(checkQuery, [ID], async (err, result) => {
			if (err) {
				console.error('Error executing query:', err);
				res.status(500).json({ message: 'Internal server error' });
				return;
			}
			if (result.length > 0 && !result[0].HasVoted) { // voteId exists and has not voted
				// Fetch voteId from the database using the ID
				connection.query(fetchVoteIdQuery, [ID], async (err, result) => {
					if (err) {
						console.error('Error executing query:', err);
						res.status(500).json({ message: 'Internal server error' });
						return;
					}

					if (result.length > 0) {
						const fetchedVoteId = result[0].VoteID;

						// Hash the fetched voteId with the salt
						const hashedFetchedVoteId = await hashString(fetchedVoteId + salt);

						// Compare the hashed fetched voteId with the voteId from the decrypted message
						console.log('hashedFetchedVoteId:', hashedFetchedVoteId)
						console.log('voteId:', voteId)
						console.log('fetchedVoteId:', fetchedVoteId + salt)

						if (hashedFetchedVoteId !== voteId) {
							console.log('voteId from database does not match voteId from decrypted message');
							res.status(409).json({ message: 'voteId mismatch' });
							return;
						}

						// If voteId matches, update the vote status and insert the encrypted ballot into the database
						connection.query(updateQuery, [ID], (err, result) => {
							if (err) {
								console.error('Error executing query:', err);
								res.status(500).json({ message: 'Internal server error' });
							} else {
								console.log('VoteID updated in database');
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
						console.log('No vote found with the provided ID');
						res.status(404).json({ message: 'No vote found with the provided ID' });
					}
				});
			} else {
				console.log('VoteID does not exist or has already voted');
				console.log('Result:', result);
				res.status(409).json({ message: 'VoteID does not exist or has already voted' });
			}
		});

	}
});

module.exports = router;