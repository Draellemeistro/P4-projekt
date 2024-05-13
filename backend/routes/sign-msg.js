
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	const body = JSON.parse(req.body);
	const message = body.message;
	const signature = body.signature;
	const verified = await serverDigSig.verifyReceivedMessage(message, signature);
	res.json({result: verified})
});

module.exports = router;