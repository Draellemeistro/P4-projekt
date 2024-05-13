
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	let waitingForVerify = true
	const message = req.body.message;
	const signature = req.body.signature;
	console.log(typeof message);
	console.log(typeof signature);
	console.log(message);
	waitingForVerify = await serverDigSig.verifyReceivedMessage(message, signature);
	console.log('stopped waiting?', waitingForVerify);
	res.json({result: waitingForVerify})
});

module.exports = router;