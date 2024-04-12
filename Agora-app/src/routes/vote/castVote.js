const crypto = require('crypto');
const { readFileSync } = require('fs');
const publicKey = readFileSync('Agora-app/static/server_id_rsa_pub.pem', 'utf8');
const ballot = readFileSync('Agora-app/static/', 'utf8');
// eslint-disable-next-line no-unused-vars
const encryptedBallot = encryptBallot(ballot, publicKey);
function encryptBallot(ballot, publicKey) {

	return crypto.publicEncrypt(publicKey, Buffer.from(ballot)).toString('base64');
}