const crypto = require('crypto');

function generateOTP() {
	return crypto.randomBytes(3).toString('hex');
}
module.exports = { generateOTP };