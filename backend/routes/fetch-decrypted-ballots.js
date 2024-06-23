const express = require('express');
const { decryptFullBox } = require('../utils/cryptoFunctions/decryptFullBox.js');
const router = express.Router();

router.get('/decrypt-full-box', async (req, res) => {
    try {
        const ballotArray = await decryptFullBox();
        res.json(ballotArray);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;