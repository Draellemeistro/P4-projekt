const jwt = require('jsonwebtoken');

const SECRET_KEY = '1a2s21j4321231'; // Replace with real key

// Function to generate a new JWT
function generateToken(personId, voteId) {
	const payload = { personId, voteId };

	token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
	verifyToken(token)
}

// Middleware function to verify JWT and protect routes
function verifyToken(token) {
	if (!token) {
		console.log('No token provided');
		throw new Error('No token provided.');
	}

	let decoded;
	try {
		decoded = jwt.verify(token, SECRET_KEY);
	} catch (err) {
		console.log('Failed to authenticate token', err);
		throw new Error('Failed to authenticate token.');
	}

	return decoded;
}

module.exports = {
	generateToken,
	verifyToken,
};