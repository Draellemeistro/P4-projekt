const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const connection = mysql.createConnection({
	host: '130.225.39.205',
	user: 'user',
	password: 'password',
	database: 'Agora',
	port: '3366'
});

router.post('/', (req, res) => {
	const { personId, voteId } = req.body;

	connection.query('SELECT email FROM Agora.users WHERE person_id = ? AND vote_id = ?', [personId, voteId], (err, results) => {
		if (err) {
			res.status(500).send('Error fetching email from database');
		} else {
			if (results.length > 0) {
				const email = results[0].email;
				res.json({ email });
			} else {
				res.status(404).send('No user found with the provided personId and voteId');
			}
		}
	});
});

module.exports = router;