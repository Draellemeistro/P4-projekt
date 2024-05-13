const express = require('express');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig.js');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	const message = req.body.message;
	const signature = await serverDigSig.prepareSignatureToSend(message);
res.json({message: message, signature: signature});
});

module.exports = router;