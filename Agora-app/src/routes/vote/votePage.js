// eslint-disable-next-line no-unused-vars
import ECDHCrypto from '../../utils/encryptionECDH.js';
import { sendBallotToServerRSAtoECDH } from '../../utils/apiService.js';
//import RSACrypto from '../../utils/encryptionRSA.js';
import combo from '../cryptoTests/combinedEncryption.js';

export function getCandidatesFromServer() {
	return fetch('/fetch-candidates')
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			console.log('data: ', data);
			return data;
		})
		.catch(error => {
			// Handle any errors that occurred while fetching the candidates
			console.error('Error:', error);
		});
}

export async function encryptBallot(ballot) {
	console.log('encryptBallot ballot..:', ballot);
	let clientKeyPub;
	let encryptedMessage;
	let outGoingMessage;
	let ivValue;
	if (typeof ballot !== 'string') {
		ballot = JSON.stringify(ballot);
	}
	console.log('before RSApart:\n', ballot, '\n\ntype:', typeof ballot,);
	encryptedMessage = await combo.RSApart(ballot);
	let innerMessage = await combo.prepareSubLayer(encryptedMessage, {testString: 'testString', testNumber: 12345});
	console.log('before ECDHpart');
	let ECDHpart = await combo.ECDHpart(innerMessage);
	outGoingMessage = ECDHpart.encryptedMessage;
	clientKeyPub = ECDHpart.clientPublicKey;
	ivValue = ECDHpart.ivValue;
	let clientKeyPubString = await ECDHCrypto.exportKeyString(clientKeyPub);
	return await combo.prepareBallotForServer(outGoingMessage, clientKeyPubString, ivValue);
}

// eslint-disable-next-line no-unused-vars
export async function sendEncryptedBallotToServer(ballot) {
	let encryptedBallot = await encryptBallot(ballot);
	// eslint-disable-next-line no-unused-vars
	const response = sendBallotToServerRSAtoECDH(encryptedBallot);
	}

