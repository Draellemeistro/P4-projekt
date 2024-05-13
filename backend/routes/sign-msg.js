
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');
const express = require('express');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	let waitingForVerify = true
	console.log(req.body);
	let messageObject = req.body.msgobj;
	if(typeof messageObject == 'string'){
		messageObject = JSON.parse(messageObject);
	}
	const message = messageObject.message;
	const signature = messageObject.signature;
	console.log(typeof message);
	console.log(typeof signature);
	console.log(message);
	waitingForVerify = await serverDigSig.verifyReceivedMessage(message, signature);
	console.log('stopped waiting?', waitingForVerify);
	res.json({result: waitingForVerify})
});

module.exports = router;