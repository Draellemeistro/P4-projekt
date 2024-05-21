import cryptoUtils from '../../utils/cryptoUtils.js';
import { getCandidatesFromServer, sendBallotToServer } from '../../utils/apiService.js';

export async function requestCandidates(token) {
	const response = await getCandidatesFromServer(token);
	console.log('waiting done')
	if (response.ok) {
		const data = await response.json();
		console.log('data: ', data);
		const verify = await cryptoUtils.digSig.verifyReceivedMessage(data.signature, JSON.stringify(data.results));
		if (verify) {
			console.log('successfully verified the servers signature');
		}
		const candidates = data.results.map(item => [item.candidate, item.party]);
		console.log('candidates: ', candidates);
		return candidates;
	} else {
		console.log('Error fetching candidates from server');
		return [];
	}
}
export function formatCandidates(candidates) {
	let parties = {};
	candidates.forEach(([name, party]) => {
		if (party === "N/A")
			party = "Outside of the parties"

		if (!parties[party])
			parties[party] = [];

		parties[party].push(name);
	});
	return parties;
}

export async function handleBallot(ballot) {
	const encryptedBallot = await cryptoUtils.encryptBallot(ballot);
	const token = sessionStorage.getItem('token');
	const response = await sendBallotToServer(encryptedBallot, token);

			// if (response.ok) {
			// 	const data = await response.json();
			// 	const verify = await cryptoUtils.digSig.verifyReceivedMessage(data.signature, data.message);
			// 	if (verify) {
			// 		console.log('Server successfully verified the signature');
			// 		if (data.message === encryptedBallot.message) {
			// 			console.log('Server received the correct message');
			// 		}
			// 	}
			// }



}