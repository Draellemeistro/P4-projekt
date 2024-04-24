import { userContext } from './userContext.js';

function setServerCommand(command) {
	const serverIP = '130.225.39.205';
	const serverPort = '443';
	switch (command) {
		case 'login':
			return `https://${serverIP}:${serverPort}/login`;
		case 'get-email':
			return `https://${serverIP}:${serverPort}/get-email`;
			case 'verify-2fa':
			return `https://${serverIP}:${serverPort}/verify-2fa`;
		default:
			console.log('Invalid command');
			return `https://${serverIP}:${serverPort}/${command}`;
	}
}
function setPageMetrics() {
	let isLoading = false;
	let isSuccess = false;
	let errors = {};
	let showModal = false;
	let pageMetrics;
	pageMetrics = { isLoading, isSuccess, showModal, errors   };
	return pageMetrics;
}
function setUserData(detail) {
	const { personId, voteId } = detail;
	userContext.set({ personId, voteId });
	return { personId, voteId };
}

//function getUserData(detail) {
function submitLoginCredentials(pageMetrics, detail) {
	const { personId, voteId } = detail;
	// eslint-disable-next-line no-unused-vars
	let {isLoading, isSuccess, showModal, errors} = pageMetrics;
	if (personId.length === 0) {
		errors.personIdLabel = "Field should not be empty";
	}
	if (voteId.length === 0) {
		errors.voteId = "Field should not be empty";
	}

	if (Object.keys(errors).length === 0) {
		// eslint-disable-next-line no-unused-vars
		isLoading = true;
		fetch(setServerCommand('get-email'), {// change server address here
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ personId, voteId }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Error fetching email 1');
				}
				return response.text();
			})
			.then(email => {
				// Handle the retrieved email
				showModal = true;
				console.log('Retrieved email:', email);
				isLoading = false;

			})
			.catch(err => {
				errors.server = err;
				console.log('error 1')
				isLoading = false;
			});
	}
}

function verify2FA(pageMetrics, twoFACode,detail)  {
	// eslint-disable-next-line no-unused-vars
	let {isLoading, isSuccess, errors, showModal} = pageMetrics;
	const { personId, voteId } = detail;
	fetch(setServerCommand('verify-2fa'), { // change server address here
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ twoFACode, personId, voteId }),
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Error verifying 2FA');
			}
			return response.text();
		})
		.then(message => {
			console.log('Server response:', message);
			if (message === 'User verified') {
				isSuccess = true;

			}
		})
		.catch(err => {
			console.error('Error:', err);
		});
	// return something???
}


module.exports = { setServerCommand, setPageMetrics, setUserData, submitLoginCredentials, verify2FA };

