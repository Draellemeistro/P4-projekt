const jwt = require('jsonwebtoken');

const SECRET_KEY = '1a2s21j4321231'; // Replace with real key

function generateToken(personId, voteId) {
	const payload = { personId, voteId };
	console.log('payload', payload);
	return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

function verifyToken(token) {
	if (!token) {
		console.log('No token provided');
		return false;
	}

	let decoded;
	try {
		decoded = jwt.verify(token, SECRET_KEY);
	} catch (err) {
		console.log('Failed to authenticate token', err);
		return false;
	}
	console.log('Token verified');
	return decoded;
}

module.exports = {
	generateToken,
	verifyToken,
};