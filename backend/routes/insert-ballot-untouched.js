const express = require('express');
const connection = require('../utils/db.js');

const router = express.Router();
router.post('/insert-ballot', (req, res) => {
	let encBallot = req.body.ballot;
	const pubKeyECDH = req.body.clientKeyPub;
	const ivHexString = req.body.ivValue;
	if (typeof encBallot !== 'string') {
		encBallot = JSON.stringify(encBallot);
	}
	const query = 'INSERT INTO Agora.ballotbox (encr_ballot, ECDH_pub_key, iv_value) VALUES (?, ?, ?)';
	connection.query(query, [encBallot, pubKeyECDH, ivHexString], (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error inserting data into database');
		} else {
			console.log('vote inserted successfully');
			res.json({ message: 'Data inserted successfully', results });
		}
	}

	);
});

module.exports = router;