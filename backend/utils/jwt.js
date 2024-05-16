const jwt = require('jsonwebtoken');

const SECRET_KEY = '1a2s21j4321231'; // Replace with real key

// Function to generate a new JWT
function generateToken(personId, voteId) {
	const payload = { personId, voteId };

	token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
	return token;
}

// Middleware function to verify JWT and protect routes
function verifyToken(token) {
	if (!token) {
		console.log('No token provided');
			return false
	}

	let decoded;
	try {
		decoded = jwt.verify(token, SECRET_KEY);
		console.log('Decoded token:', decoded);
	} catch (err) {
		console.log('Failed to authenticate token', err);
		return false
	}
	console.log('Token verified');
	return true;
}

module.exports = {
	generateToken,
	verifyToken,
};