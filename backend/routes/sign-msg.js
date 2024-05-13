
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	const message = req.body.message;
	const signature = req.body.signature;
	const verified = await serverDigSig.verifyReceivedMessage(message, signature);
	console.lo
	res.json({result: verified})
});

module.exports = router;