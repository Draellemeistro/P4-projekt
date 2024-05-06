// eslint-disable-next-line no-unused-vars
import ECDHCrypto from '../../utils/encryptionECDH.js';
import { sendBallotToServer } from '../../utils/apiService.js';
import RSACrypto from '../../utils/encryptionRSA.js';

export const prepareECDHBallot = async (messageToEncrypt) => {
	let serverPubKeyECDH = await ECDHCrypto.requestServerECDH();
	let BothKeysECDH = await ECDHCrypto.initECDH();
	let sharedSecret = await ECDHCrypto.deriveSecret(BothKeysECDH.privKey, serverPubKeyECDH)
	let encryptionInfo = await ECDHCrypto.encryptECDH(messageToEncrypt, sharedSecret);
	let encryptedBallot = encryptionInfo.encryptedMessage;
	let ivValue = encryptionInfo.ivValue;
	let clientPubKeyExport = await ECDHCrypto.exportKeyString(BothKeysECDH.pubKey);

	return {encryptedBallot: encryptedBallot, clientPubKey: clientPubKeyExport, ivValue: ivValue};
}
export const prepareRSABallot = async (messageToEncrypt) => {
	let serverPubKeyRSA = await RSACrypto.request();
	return  {encryptedBallot: await RSACrypto.encrypt(messageToEncrypt, serverPubKeyRSA),clientPubKey: null, ivValue: null};
}

export const readyBallotForTransmission = async (ballot, encryptChoice = 'RSAECDH') => {
	if ( typeof ballot !== 'string') {
		ballot = JSON.stringify(ballot);
	}
	let encryptedBallot;
	switch (encryptChoice) {
		case 'onlyECDH':
			return await prepareECDHBallot(ballot);
		case 'onlyRSA':
			return await prepareRSABallot(ballot)
		case 'RSAECDH':
			encryptedBallot = JSON.stringify(await prepareRSABallot(ballot));
			return await prepareECDHBallot(encryptedBallot);
		case 'ECDHRSA':
			encryptedBallot = JSON.stringify(await prepareECDHBallot(ballot));
			return await prepareRSABallot(encryptedBallot);
		default:
			console.error('No or incorrect encryption method chosen');
			return false;
	}
}

export const encryptAndSendBallot = async (ballot, encryptChoice = 'RSAECDH') => {
	let readyBallot = await readyBallotForTransmission(ballot, encryptChoice);
	return await sendBallotToServer(readyBallot.encryptedBallot,readyBallot.clientPubKey, readyBallot.ivValue);
}

function getCandidatesFromServer() {
	return fetch('/fetch-candidates')
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			//console.log(data);
			return data;
		})
		.catch(error => {
			// Handle any errors that occurred while fetching the candidates
			console.error('Error:', error);
		});
}
module.exports = { getCandidatesFromServer, sendBallotToServer };