const express = require('express');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig.js');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
	let detailsObj;
	if (typeof req.body.msgForServer === 'string') {
		console.log('String detected');
		detailsObj = JSON.parse(req.body.msgForServer);
	} else {
		detailsObj = req.body.msgForServer;
	}
});

module.exports = router;