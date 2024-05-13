
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig.js');
const express = require('express');

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
	console.log('Details object: ', detailsObj);
	res.json({success: true});
});

module.exports = router;