const express = require('express');
const db = require('../utils/db.js');
const { verifyToken } = require('../utils/jwt.js');

const router = express.Router();
router.post('/', async (req, res) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.status(401).json({ error: 'No token provided' }); // if there isn't any token

	if (verifyToken(token)) {
		try {
			const results = await db.getCandidates();
			res.json(results);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Error fetching candidates from database' });
		}
	} else {
		res.status(401).json({ error: 'Invalid token' });
	}
});

module.exports = router;