const { generateToken, verifyToken } = require('../utils/jwt');

test('Token is correctly generated and verified for valid personId and voteId', () => {
	const personId = '123';
	const voteId = '456';
	const token = generateToken(personId, voteId);

	const decoded = verifyToken(token);

	expect(decoded).toBeTruthy();
	expect(decoded.personId).toBe(personId);
	expect(decoded.voteId).toBe(voteId);
});

test('Token verification fails for an invalid token', () => {
	const token = 'invalidToken';

	const decoded = verifyToken(token);

	expect(decoded).toBeFalsy();
});