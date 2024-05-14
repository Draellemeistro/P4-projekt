import cryptoUtils from '../../utils/cryptoUtils.js';
import { getCandidatesFromServer, sendBallotToServer } from '../../utils/apiService.js';

export async function requestCandidates() {
	const response = await getCandidatesFromServer();
	if (response.ok) {
		const data = await response.json();
		console.log('data: ', data);
		const candidates = data.map(item => [item.candidate, item.party]);
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
	const response = await sendBallotToServer(encryptedBallot);
	if (response.ok) {
		const data = await response.json();
		console.log('data: ', data);
		return data;
	} else {
		console.log('Error sending ballot to server');
		return  'Error sending ballot to server';
	}
}