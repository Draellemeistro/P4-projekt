import { exchangeKeys } from '../../utils/apiServiceDev.js';
import cryptoUtils from '../../utils/cryptoUtils.js';

export const packageAndExchangeKeys = async () => {
	console.log('Accessed packageAndExchangeKeys');
	const keyRing = await cryptoUtils.packagePublicKeys();
	const response = await exchangeKeys(keyRing);
	console.log('Response: ', response);
	if (response.ok) {
		const data = await response.json();
		console.log('Data: ', data);
		if (typeof data === 'string') {
			const keyRing = JSON.parse(data.keyRing);
			cryptoUtils.ECDH.saveServerKey(keyRing.ECDH).then(r => {
				console.log('Server ECDH key saved: ', r);
			});
			await cryptoUtils.digSig.saveServerKey(keyRing.DigSig);
			console.log('Keyring: ', keyRing);
			console.log('Server keys saved');
			console.log(keyRing.ECDH);
			return data;
		}
	}
	else {
		console.error('Error in ExchangeKeys: ', response.status);
		return response.status;
	}
}
