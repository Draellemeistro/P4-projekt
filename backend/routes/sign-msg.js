
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');

	const message = req.body.message;
	const signature = req.body.signature;
	const verify = await serverDigSig.verifyReceivedMessage(signature, message);
	res.json({result: message, signature})
});

module.exports = router;