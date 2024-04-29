import express from 'express';
import connection from '../utils/db.js';

const router = express.Router();
router.post('/insert-ballot', (req, res) => {
	const enc_ballot = req.body.ballot;
	const enc_voter = req.body.voter;
	const pubKeyECDH = req.body.pubKeyECDH
	const query = 'INSERT INTO Agora.ballotbox (ballotbox.encr_ballot, encr_voter_id, ECDH_pub_key) VALUES (?, ?, ?)';
	connection.query(query, [enc_ballot, enc_voter, pubKeyECDH], (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			res.json({ message: 'Data inserted successfully', results });
		}
	});
});

export default router