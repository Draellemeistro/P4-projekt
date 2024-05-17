const crypto = require('crypto');
const serverECDH = require('./cryptoFunctions/serverECDH');
const serverRSA = require('./cryptoFunctions/serverRSA');
const serverDigSig = require('./cryptoFunctions/serverDigSig');
//function exportPublicKeys() {
//	const rsa = exportKeyToString(serverRSA.getPubKey());
//	const ecdh = exportKeyToString(serverECDH.getPubKey());
//	const digSig = exportKeyToString(serverDigSig.getPubKey());
//	return { RSA: rsa, ECDH: ecdh, DigSig: digSig };
//}
function allKeysAreLoaded() {
	return publicKeysAreLoaded() && privateKeysAreLoaded();
}
function publicKeysAreLoaded() {
	return serverECDH.pubKey !== null && serverRSA.pubKey !== null && serverDigSig.pubKey !== null;
}

function privateKeysAreLoaded() {
	return serverECDH.privKey !== null && serverRSA.privKey !== null && serverDigSig.privKey !== null;
}
async function loadAllKeys() {
	await serverRSA.loadKeys();
	await serverECDH.loadKeys();
	await serverDigSig.loadKeys();
	return 'Keys loaded successfully.'
}

module.exports = {
	allKeysAreLoaded,
	publicKeysAreLoaded,
	privateKeysAreLoaded,
	loadAllKeys
};
