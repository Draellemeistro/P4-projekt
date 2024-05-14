import cryptoUtils from '../../utils/cryptoUtils.js';
import { getCandidatesFromServer } from '../../utils/apiService.js';

export async function requestAndFormatCandidates() {
	const response = await getCandidatesFromServer();
	if (response.ok) {
		const data = await response.json();
		console.log('data: ', data);
		const candidates = data.map(item => [item.candidate, item.party]);
		console.log('candidates: ', candidates);
		return candidates;
	} else {
		throw new Error('Error fetching candidates from server');
	}
}

export async function sendEncryptedBallotToServer(ballot) {
	// eslint-disable-next-line no-unused-vars
	const encryptedBallot = await encryptBallot(ballot);
console.log('response: ', encryptedBallot);
	return encryptedBallot;
}

export async function encryptBallot(ballot) {
	let encryptedBallot = await cryptoUtils.encryptBallot(ballot);
	console.log('Encrypted ballot: ', encryptedBallot);
	return encryptedBallot;
}