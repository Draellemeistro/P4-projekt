const express = require('express');
const db = require('../utils/db.js'); // Import db instead of connection
const { verifyToken } = require('../utils/jwt.js');

const router = express.Router();
router.post('/', async (req, res) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401); // if there isn't any token
	if (verifyToken(token)) {
		try {
			const results = await db.getCandidates(); // Use the new function
			res.json(results);
		} catch (err) {
			console.error(err);
			res.status(500).send('Error fetching candidates from database');
		}
	}
});

module.exports = router;