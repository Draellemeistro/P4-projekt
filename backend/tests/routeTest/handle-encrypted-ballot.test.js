const { handleEncryptedBallot } = require('../../routes/handle-encrypted-ballot');

// Mock the dependencies
jest.mock('../../utils/db.js');
jest.mock('../../utils/cryptoFunctions/serverECDH.js');
jest.mock('../../utils/cryptoFunctions/serverDigSig');
jest.mock('../../utils/jwt');
jest.mock('../../utils/keyStore');
jest.mock('../../utils/cryptoFunctions/serverCryptoUtils');

const db = require('../../utils/db.js');
const crypto = require('../../utils/cryptoFunctions/serverECDH.js');
const digSig = require('../../utils/cryptoFunctions/serverDigSig');
const jwt = require('../../utils/jwt');
const { keyStore } = require('../../utils/keyStore');
const cryptoUtils = require('../../utils/cryptoFunctions/serverCryptoUtils');

afterEach(() => {
	jest.resetAllMocks();
});

// Test for 'Invalid token' error
test('handleEncryptedBallot throws "Invalid token" error', async () => {
	jwt.verifyToken.mockReturnValue(null);

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};
	await expect(handleEncryptedBallot(req)).rejects.toThrow('Invalid token');
});

// Test for 'No keys found for personId' error
test('handleEncryptedBallot throws "No keys found for personId" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId' });
	keyStore['personId'] = null;

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('No keys found for personId: personId');
});

// Test for 'Digital Signature verify returned false' error
// test('handleEncryptedBallot throws "Digital Signature verify returned false" error', async () => {
// 	jwt.verifyToken.mockReturnValue({ personId: 'personId' });
// 	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
// 	digSig.verify.mockReturnValue(false);
//
// 	const req = {
// 		headers: {
// 			'authorization': 'Bearer token'
// 		},
// 		body: {
// 			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
// 			signature: 'signature'
// 		}
// 	};
//
// 	await expect(handleEncryptedBallot(req)).rejects.toThrow('Digital Signature verify returned false');
// });

// Test for 'voteId mismatch' error
test('handleEncryptedBallot throws "voteId mismatch" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId', voteId: 'wrongVoteId' });
	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
	digSig.verify.mockReturnValue(true);
	crypto.handleEncryptedMessage.mockReturnValue(JSON.stringify({ innerLayer: 'innerLayer', voteId: 'voteId', salt: 'salt', ID: 'ID' }));

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: 'message',
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('voteId mismatch');
});

// Test for 'VoteID does not exist or has already voted' error
test('handleEncryptedBallot throws "VoteID does not exist or has already voted" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId', voteId: 'voteId' });
	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
	digSig.verify.mockReturnValue(true);
	crypto.handleEncryptedMessage.mockReturnValue(JSON.stringify({ innerLayer: 'innerLayer', voteId: 'voteId', salt: 'salt', ID: 'ID' }));
	db.checkVoteStatus.mockReturnValue(false);

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('VoteID does not exist or has already voted');
});

// Test for 'voteId mismatch' error
test('handleEncryptedBallot throws "voteId mismatch" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId', voteId: 'voteId' });
	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
	digSig.verify.mockReturnValue(true);
	crypto.handleEncryptedMessage.mockReturnValue(JSON.stringify({ innerLayer: 'innerLayer', voteId: 'voteId', salt: 'salt', ID: 'ID' }));
	db.checkVoteStatus.mockReturnValue(true);
	db.getVoteId.mockReturnValue('wrongVoteId');
	cryptoUtils.hashString.mockReturnValue('hashedVoteId');

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('voteId mismatch');
});

// Test for 'Failed to update vote status' error
test('handleEncryptedBallot throws "Failed to update vote status" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId', voteId: 'voteId' });
	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
	digSig.verify.mockReturnValue(true);
	crypto.handleEncryptedMessage.mockReturnValue(JSON.stringify({ innerLayer: 'innerLayer', voteId: 'voteId', salt: 'salt', ID: 'ID' }));
	db.checkVoteStatus.mockReturnValue(true);
	db.getVoteId.mockReturnValue('voteId');
	cryptoUtils.hashString.mockReturnValue('hashedVoteId');
	db.updateVoteStatus.mockReturnValue(false);
	cryptoUtils.hashString.mockReturnValue('voteId');

	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('Failed to update vote status');
});

// Test for 'Failed to insert encrypted ballot' error
test('handleEncryptedBallot throws "Failed to insert encrypted ballot" error', async () => {
	jwt.verifyToken.mockReturnValue({ personId: 'personId', voteId: 'voteId' });
	keyStore['personId'] = { ECDH: 'ECDHKey', DigSig: 'DigSigKey' };
	digSig.verify.mockReturnValue(true);
	crypto.handleEncryptedMessage.mockReturnValue(JSON.stringify({ innerLayer: 'innerLayer', voteId: 'voteId', salt: 'salt', ID: 'ID' }));
	db.checkVoteStatus.mockReturnValue(true);
	db.getVoteId.mockReturnValue('voteId');
	cryptoUtils.hashString.mockReturnValue('hashedVoteId');
	db.updateVoteStatus.mockReturnValue(true);
	db.insertEncryptedBallot.mockReturnValue(false);
	cryptoUtils.hashString.mockReturnValue('voteId');


	const req = {
		headers: {
			'authorization': 'Bearer token'
		},
		body: {
			message: JSON.stringify({ encryptedMessage: 'encryptedMessage', ivValue: 'ivValue' }),
			signature: 'signature'
		}
	};

	await expect(handleEncryptedBallot(req)).rejects.toThrow('Failed to insert encrypted ballot');
});