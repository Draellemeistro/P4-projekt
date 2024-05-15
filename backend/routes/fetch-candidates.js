const express = require('express');
const connection = require('../utils/db.js');
const { verifyToken } = require('../utils/jwt.js');

const router = express.Router();
router.post('/', (req, res) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401); // if there isn't any token
	if (verifyToken(token)) {
		connection.query('SELECT candidate, party FROM Agora.ballot', (err, results) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error fetching candidates from database');
			} else {
				res.json(results);
			}
		});
	}
});

module.exports = router;