import { exchangeKeys } from '../../utils/apiServiceDev.js';
import cryptoUtils from '../../utils/cryptoUtils.js';

export const packageAndExchangeKeys = async () => {
	console.log('Accessed packageAndExchangeKeys');
	const keyRing = await cryptoUtils.packagePublicKeys();
	const response = await exchangeKeys(keyRing);
	console.log('Response: ', response);
	if (response.ok) {
		const data = await response.json();
		if (typeof data === 'string') {
			const keyRing = JSON.parse(data);
			await cryptoUtils.ECDH.saveServerKey(keyRing.ECDH);
			await cryptoUtils.digSig.saveServerKey(keyRing.DigSig);
			return data;
		}
	}
	else {
		console.error('Error in ExchangeKeys: ', response.status);
		return response.status;
	}
}
