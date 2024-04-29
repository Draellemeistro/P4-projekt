// backend/routes/fetch-candidates.js
import express from 'express';
import connection from '../utils/db';

const router = express.Router();

router.post('/', (req, res) => {
	connection.query('SELECT candidate, party FROM Agora.ballot', (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error fetching candidates from database');
		} else {
			res.json(results);
		}
	});
});

export default router
