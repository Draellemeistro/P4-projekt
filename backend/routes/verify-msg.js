const express = require('express');
const serverDigSig = require('../utils/cryptoFunctions/serverDigSig.js');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /sign-msg endpoint');
res.json({success: true});
});

module.exports = router;