const serverRSA = require('../utils/cryptoFunctions/serverRSA');
const serverECDH = require('../utils/cryptoFunctions/serverECDH');
const serverDigSig = require('../utils/cryptoFunctions/ServerDigSig');
const express = require('express');
const serverECDHCrypto = require('../utils/cryptoFunctions/serverECDH');

const router = express.Router();
router.post('/', async (req, res) => {
	console.log('Accessed /request-server-keys endpoint');
	let keyRingForImport;
	if (req.body.keyRing) {
		if(typeof req.body.keyRing === 'string') {
			keyRingForImport = JSON.parse(req.body.keyRing);
		} else {
			keyRingForImport = req.body.keyRing;
		}
		console.log('Keyring for import: ', keyRingForImport.ECDH);
		console.log(typeof keyRingForImport.ECDH);

		await serverECDH.importClientKey(JSON.parse(keyRingForImport.ECDH));
		await serverDigSig.importClientKey(JSON.parse(keyRingForImport.DigSig));
	}
	const RSA = await serverRSA.exportKeyToString();
	const ECDH = await serverECDH.exportKeyToString();
	const DigSig = await serverDigSig.exportKeyToString();
	const keyRing = JSON.stringify({ RSA: RSA, ECDH: ECDH, DigSig: DigSig });
	res.json({ message: 'Keys sent', keyRing: keyRing });
});

module.exports = router;