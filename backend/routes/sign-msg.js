
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	let waitingForVerify = true
	const body = JSON.parse(req.body);
	const message = body.message;
	const signature = body.signature;
	console.log(message);
	waitingForVerify = await serverDigSig.verifyReceivedMessage(message, signature);
	console.log('stopped waiting?', waitingForVerify);
	res.json({result: waitingForVerify})
});

module.exports = router;