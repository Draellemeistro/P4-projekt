const jwt = require('jsonwebtoken');

const SECRET_KEY = '1a2s21j4321231'; // Replace with real key

// Function to generate a new JWT
function generateToken(personId, voteId) {
	const payload = { personId, voteId };
	return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Middleware function to verify JWT and protect routes
function verifyToken(req, res, next) {
	const token = req.headers['authorization'];

	if (!token) {
		return res.status(403).send({ message: 'No token provided.' });
	}

	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err) {
			return res.status(500).send({ message: 'Failed to authenticate token.' });
		}

		// If token is successfully verified, save decoded info to request for use in other routes
		req.userId = decoded.id;
		next();
	});
}

module.exports = {
	generateToken,
	verifyToken,
};